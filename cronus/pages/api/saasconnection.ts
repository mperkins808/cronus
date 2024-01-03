import canReq from "@/hooks/serverSide/auth";
import { IV, decrypt, encrypt } from "@/hooks/serverSide/encryption";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import axios from "axios";
import { create } from "domain";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const validU = await canReq(req, res, "user");

  if (!validU) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "GET") {
    return ValidateAPIConnection(req, res);
  }

  if (req.method === "POST") {
    return EstablishAPIConnection(req, res);
  }

  return res.status(400).json({ error: "Bad Request" });
};

async function ValidateAPIConnection(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();

  console.log("validating API connection");
  try {
    const result = await prisma.saaSConnection.findFirst();

    if (result === null) {
      console.log("API key has not been established yet");
      await prisma.$disconnect();
      return res.status(401).json({ error: "no api key found" });
    }

    let encrpytedKey = result.value;
    const iv = IV();
    const descryptedKey = decrypt(encrpytedKey, iv);

    const Auth = {
      headers: {
        Authorization: `Bearer ${descryptedKey}`,
      },
    };

    const resp = await axios.get(
      `${process.env.ADMIN_CRONUS_SAAS_URL}/healthy`,
      Auth
    );
    if (resp.status !== 200) {
      console.error("API key is invalid");
      return res.status(resp.status).json(resp.data);
    }

    return res.status(403).json({ error: "API key is invalid" });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(500).json({ error: "something went wrong" });
  }
}

async function EstablishAPIConnection(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { apikey } = req.query;

  // test connection to saas
  // if not ok return

  if (apikey === undefined) {
    return res.status(403).json({ error: "API Key is invalid" });
  }

  console.log("Validating API Key");
  try {
    const Auth = {
      headers: {
        Authorization: `Bearer ${apikey}`,
      },
    };
    const resp = await axios.get(
      `${process.env.ADMIN_CRONUS_SAAS_URL}/api/healthy`,
      Auth
    );
    if (resp.status !== 200) {
      console.error("API key is invalid");
      return res.status(resp.status).json(resp.data);
    }
  } catch (error) {
    console.error(`API key is invalid. error : ${error}`);
    return res.status(403).json({ error: "API Key is invalid" });
  }

  // encrypt the token
  const iv = IV();
  let encrpyted: string | null = "";

  encrpyted = encrypt(String(apikey), iv);

  if (!encrpyted) {
    console.error(`when trying to store the API Key, the encrpytion failed`);
    return res.status(500).json({ error: "Something went wrong" });
  }

  // if ok get record
  const prisma = new PrismaClient();

  try {
    const updated = await prisma.saaSConnection.upsert({
      create: {
        id: "apikey",
        value: encrpyted,
        validated: true,
        iv: iv.toString("hex"),
      },
      update: {
        value: encrpyted,
        validated: true,
        iv: iv.toString("hex"),
      },
      where: {
        id: "apikey",
      },
    });
    await prisma.$disconnect();
    return res.status(200).json({ message: "API key added" });
  } catch (error) {
    console.error(error);
    return res
      .status(403)
      .json({ error: "Key is valid but something went wrong storing it" });
  }
}
