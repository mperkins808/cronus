import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import canReq from "@/hooks/serverSide/auth";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const validU = await canReq(req, res, "user");
  const validA = await canReq(req, res, "admin");
  const validM = await canReq(req, res, "mobile");

  if (req.method === "POST") {
    if (!validA) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return addQuery(req, res);
  }
  if (req.method === "GET") {
    if (!validM) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return getQuery(req, res);
  }

  if (req.method === "DELETE") {
    if (!validA) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return deleteQuery(req, res);
  }

  if (req.method === "PATCH") {
    if (!validA) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return updateQuery(req, res);
  }
  return res.status(400).json({ error: "bad request" });
};

async function addQuery(req: NextApiRequest, res: NextApiResponse) {
  let {
    raw_query,
    datasource_id,
    step,
    time,
    datasource_type,
    name,
    cronus_label,
  } = req.query;

  if (
    raw_query === undefined ||
    datasource_id === undefined ||
    step === undefined ||
    time === undefined ||
    datasource_type === undefined ||
    name === undefined
  ) {
    return res.status(400).json({ error: "bad request, missing variables" });
  }

  const id = randomUUID();
  const created_at = Math.floor(Date.now() / 1000);

  const prisma = new PrismaClient();
  let pull = {};
  try {
    const prisma = new PrismaClient();
    const result = await prisma.dSQuery.create({
      data: {
        id: String(id),
        datasource_id: String(datasource_id),
        raw_query: String(raw_query),
        name: String(name),
        step: String(step),
        time: String(time),
        datasource_type: String(datasource_type),
        cronus_label: String(cronus_label),
        created_at: Number(created_at),
      },
    });
    console.log(`successfully created query. name : ${name}. id : ${id}`);
    pull = await prisma.dSQuery.findMany();
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    return res.status(400).json({ error: `${id} already exists` });
  }
  await prisma.$disconnect();
  return res.status(201).json(pull);
}

async function getQuery(req: NextApiRequest, res: NextApiResponse) {
  let { id } = req.query;
  let cursor = "any";
  if (id !== undefined) {
    cursor = String(id);
  }

  const prisma = new PrismaClient();
  try {
    if (cursor === "any") {
      const pull = await prisma.dSQuery.findMany({
        orderBy: {
          created_at: "asc",
        },
      });
      await prisma.$disconnect();
      return res.status(200).json(pull);
    }
    const pull = await prisma.dSQuery.findUnique({
      where: {
        id: String(cursor),
      },
    });
    await prisma.$disconnect();
    if (pull === null) {
      return res.status(404).json([]);
    }

    return res.status(200).json(pull);
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    return res.status(404).json({ error: `${id} not found` });
  }
}

async function deleteQuery(req: NextApiRequest, res: NextApiResponse) {
  let { id } = req.query;

  if (id === undefined) {
    return res.status(400).json({ error: `bad request. no id attached` });
  }

  const prisma = new PrismaClient();
  try {
    const result = await prisma.dSQuery.delete({
      where: {
        id: String(id),
      },
    });
    console.log(`successfully deleted query ${id}`);
    await prisma.$disconnect();

    return res.status(200).json({ message: `${id} successfully deleted` });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(404).json({ message: `${id} not found` });
  }
}

async function updateQuery(req: NextApiRequest, res: NextApiResponse) {
  let {
    id,
    name,
    raw_query,
    datasource_id,
    step,
    time,
    datasource_type,
    cronus_label,
  } = req.query;

  if (
    id === undefined ||
    name === undefined ||
    raw_query === undefined ||
    datasource_id === undefined ||
    step === undefined ||
    time === undefined ||
    datasource_type === undefined
  ) {
    return res.status(400).json({ error: "bad request, missing variables" });
  }

  const update = {
    name: String(name),
    raw_query: String(raw_query),
    datasource_id: String(datasource_id),
    step: String(step),
    time: String(time),
    cronus_label: String(cronus_label),
    datasource_type: String(datasource_type),
  };

  const prisma = new PrismaClient();
  let pull = {};
  try {
    const prisma = new PrismaClient();
    const result = await prisma.dSQuery.update({
      where: { id: String(id) },
      data: update,
    });

    console.log(`successfully updated query ${id}`);
    pull = await prisma.dSQuery.findMany();
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    return res.status(400).json({ error: `${id} could not be updated` });
  }
  await prisma.$disconnect();
  return res.status(201).json(pull);
}
