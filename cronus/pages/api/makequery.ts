import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import axios from "axios";
import {
  buildExternalPrometheusQuery,
  buildQuery,
  convertTimeToSteps,
} from "@/hooks/buildQuery";
import { decrypt } from "@/hooks/serverSide/encryption";
import canReq from "@/hooks/serverSide/auth";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const validU = await canReq(req, res, "mobile");

  if (!validU) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "GET") {
    return makeQuery(req, res);
  }
  return res.status(400).json({ error: "bad request" });
};

interface storedQuery {
  name: String | undefined | null;
  datasource_id: String;
  raw_query: String;
  step: String;
  time: String;
  cronus_label?: String;
}
interface datasource {
  name: String | undefined | null;
  path: String;
  authheader: String | null;
  iv: String | null;
}

async function makeQuery(req: NextApiRequest, res: NextApiResponse) {
  let { id, time } = req.query;

  const prisma = new PrismaClient();

  let storedQuery: storedQuery = {
    name: "placeholder",
    datasource_id: "placeholder",
    raw_query: "placeholder",
    step: "placeholder",
    time: "placeholer",
    cronus_label: "placeholder",
  };

  // get the query

  try {
    const result = await prisma.dSQuery.findUnique({
      where: {
        id: String(id),
      },
    });
    if (!result) {
      await prisma.$disconnect();
      return res
        .status(404)
        .json({ error: `could not find storedquery ${id}` });
    }
    let qTime = result.time;
    let step = result.step;

    if (time !== undefined) {
      qTime = String(time);
      step = String(convertTimeToSteps(qTime));
    }

    storedQuery = {
      name: result.name,
      datasource_id: result.datasource_id,
      raw_query: result.raw_query,
      step: step,
      time: qTime,
      cronus_label: result.cronus_label
        ? String(result.cronus_label)
        : undefined,
    };
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(404).json({ error: `could not find storedquery ${id}` });
  }
  // get the datasource

  let storedDatasource: datasource = {
    name: "placeholder",
    path: "placeholder",
    authheader: null,
    iv: null,
  };

  try {
    const result = await prisma.datasource.findUnique({
      where: {
        id: String(storedQuery.datasource_id),
      },
    });
    if (!result) {
      await prisma.$disconnect();
      return res.status(404).json({
        error: `could not find datasource attached to storedquery ${id}`,
      });
    }
    storedDatasource = {
      name: result.name,
      path: result.path,
      authheader: result.authheader,
      iv: result.iv,
    };
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(404).json({
      error: `could not find datasource attached to storedquery ${id}`,
    });
  }

  // build query to make to externaldatasource

  const Q = buildExternalPrometheusQuery(
    String(storedDatasource.path),
    String(storedQuery.raw_query),
    String(storedQuery.time),
    String(storedQuery.step)
  );
  let tok = "placeholder";

  if (storedDatasource.authheader) {
    const tmp = decrypt(
      String(storedDatasource.authheader),
      Buffer.from(String(storedDatasource.iv), "hex")
    );
    if (!tmp) {
      console.error(
        `when making query ${id}. unable to decrypt the datasource authentication token`
      );
      await prisma.$disconnect();
      return res.status(500).json({ error: `something went wrong` });
    }
    tok = tmp;
  }

  const headers = { Authorization: tok };

  try {
    const now = Date.now();

    const resp = await axios.get(Q, { headers: headers });
    await prisma.$disconnect();
    const end = Date.now();
    let diffTime = new Date(end - now);
    const elapsed = String(diffTime.getMilliseconds());

    console.log(`response time ${elapsed}ms for ${Q}`);
    let data = resp.data;
    for (let i = 0; i < data["data"]["result"].length; i++) {
      data["data"]["result"][i]["values"] = formatValues(
        data["data"]["result"][i]["values"],
        i
      );
      let labels = data["data"]["result"][i]["metric"];
      data["data"]["result"][i]["metric"] = formatLabels(
        labels,
        storedQuery.cronus_label
      );
    }

    return res.status(resp.status).json(resp.data);
  } catch (error: any) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(error.response.status).json(error.response.data);
  }
}

interface values {
  ts: Number;
  val: any;
  index: Number;
}
function formatValues(values: [[Number, any]], index: Number) {
  var newValues: [values] = [{ ts: 0, val: "", index: index }];

  for (let i = 0; i < values.length; i++) {
    const newVal: values = {
      ts: values[i][0],
      val: Number(values[i][1]),
      index: index,
    };
    if (i === 0) {
      newValues[0] = newVal;
    }
    newValues.push(newVal);
  }
  return newValues;
}

function formatLabels(
  labels: Record<string, string>,
  labelreplacer: String | undefined
) {
  if (labelreplacer === undefined || labelreplacer === "undefined")
    return labels;

  const regex = /{{(.*?)}}/g;

  const replacedString = labelreplacer.replace(regex, (match, key) => {
    const value = labels[key];
    return value !== undefined ? value : match;
  });

  labels["cronus_label"] = replacedString;
  return labels;
}
