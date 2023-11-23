import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { IV, encrypt } from "@/hooks/serverSide/encryption";
import canReq from "@/hooks/serverSide/auth";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const validU = await canReq(req, res, "user");
  const validA = await canReq(req, res, "admin");

  if (req.method === "POST") {
    if (!validA) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return addDatasource(req, res);
  }
  if (req.method === "GET") {
    if (!validU) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return getDatasource(req, res);
  }

  if (req.method === "DELETE") {
    if (!validA) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return deleteDatasource(req, res);
  }

  if (req.method === "PATCH") {
    if (!validA) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return updateDatasource(req, res);
  }
  return res.status(405).json({ error: `${req.method} not supported` });
};

async function addDatasource(req: NextApiRequest, res: NextApiResponse) {
  let { name, path, created_at, authheader } = req.query;

  if (name === undefined || path === undefined || created_at === undefined) {
    return res.status(400).json({ error: "bad request, missing variables" });
  }
  const id = randomUUID();

  // encrypting auth header if present
  const iv = IV();
  let encrpyted: string | null = "";
  if (authheader) {
    encrpyted = encrypt(String(authheader), iv);
    if (!encrpyted) {
      console.error(
        `when trying to create datasource, the encrpytion of the auth header failed`
      );
      return res.status(500).json({ error: `something went wrong` });
    }
  }

  const prisma = new PrismaClient();
  let pull = {};
  try {
    const result = await prisma.datasource.create({
      data: {
        id: String(id),
        name: String(name),
        path: String(path),
        created_at: Number(created_at),
        authheader: encrpyted,
        iv: iv.toString("hex"),
      },
    });
    console.log(`created datasource name : ${name} id: ${id}`);
    pull = await prisma.datasource.findMany();
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    return res.status(400).json({ error: `${id} already exists` });
  }
  await prisma.$disconnect();
  return res.status(201).json(pull);
}

async function getDatasource(req: NextApiRequest, res: NextApiResponse) {
  let { id } = req.query;
  let cursor = "any";
  if (id !== undefined) {
    cursor = String(id);
  }

  const prisma = new PrismaClient();
  try {
    if (cursor === "any") {
      const pull = await prisma.datasource.findMany({
        orderBy: {
          created_at: "asc",
        },
      });
      await prisma.$disconnect();
      return res.status(200).json(pull);
    }
    const pull = await prisma.datasource.findUnique({
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

async function deleteDatasource(req: NextApiRequest, res: NextApiResponse) {
  let { id } = req.query;

  if (id === undefined) {
    return res.status(400).json({ error: `bad request. no id attached` });
  }

  const prisma = new PrismaClient();
  try {
    const result = await prisma.datasource.delete({
      where: {
        id: String(id),
      },
    });
    console.log(result);
    console.log(`deleted datasource ${id}`);
    await prisma.$disconnect();

    return res.status(200).json({ message: `${id} successfully deleted` });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();

    return res.status(404).json({ message: `${id} not found` });
  }
}

async function updateDatasource(req: NextApiRequest, res: NextApiResponse) {
  let { id, name, path, created_at, authheader } = req.query;

  if (
    id === undefined ||
    name === undefined ||
    path === undefined ||
    created_at === undefined
  ) {
    return res.status(400).json({ error: "bad request, missing variables" });
  }

  // encrypting auth header if present
  const iv = IV();
  let encrpyted: string | null = null;
  if (authheader) {
    encrpyted = encrypt(String(authheader), iv);
    if (!encrpyted) {
      console.error(
        `when trying to create datasource, the encrpytion of the auth header failed`
      );
      return res.status(500).json({ error: `something went wrong` });
    }
  }

  const update = {
    name: String(name),
    path: String(path),
    authheader: encrpyted,
    iv: iv.toString("hex"),
  };

  const prisma = new PrismaClient();
  let pull = {};
  try {
    const prisma = new PrismaClient();
    const result = await prisma.datasource.update({
      where: { id: String(id) },
      data: update,
    });

    console.log(`updated datasource ${id}`);
    pull = await prisma.datasource.findMany();
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    return res.status(400).json({ error: `${id} could not be updated` });
  }
  await prisma.$disconnect();
  return res.status(201).json(pull);
}
