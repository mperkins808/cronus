import { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import axios from "axios";
import canReq from "@/hooks/serverSide/auth";

export default async function QueryReducer(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const validU = await canReq(req, res, "user");

  if (!validU) {
    return res.status(403).json({ error: "Forbidden" });
  }

  let { datasource } = req.query;
  if (datasource === undefined) {
    return res.status(400).json({ error: `must specify a datasource` });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: `${req.method} not supported` });
  }

  if (datasource === "prometheus") {
    return prometheusQuery(req, res);
  }

  return res.status(404).json({ error: `${datasource} not supported` });
}

async function prometheusQuery(req: NextApiRequest, res: NextApiResponse) {
  let { path, query, start, step } = req.query;

  if (
    path === undefined ||
    query === undefined ||
    start === undefined ||
    step === undefined
  ) {
    return res.status(400).json({ error: `bad request. missing variables` });
  }

  const end = String(Math.floor(Date.now() / 1000));

  const Q = `${path}/api/v1/query_range?query=${query}&start=${start}&end=${end}&step=${step}`;
  console.log(Q);
  try {
    const resp = await axios.get(Q);
    return res.status(resp.status).json(resp.data);
  } catch (error: any) {
    const code = error.response.status;
    return res.status(code).json(error.response.data);
  }
}
