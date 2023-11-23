import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { createSessionJWT } from "@/hooks/sessions";
import { storeSessionInDB } from "@/hooks/serverSide/sessiondb";

interface USER {
  username: string;
  password: string;
  role: string;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let { username, password, role } = req.body;

  if (req.method !== "POST") {
    return res.status(405).json({ error: `${req.method} not supported` });
  }

  if (username === undefined || password === undefined || role === undefined) {
    return res.status(400).json({ error: "bad request. missing variables" });
  }

  const hashedPassword = await hash(password, 10);

  const user: USER = {
    username: username,
    password: hashedPassword,
    role: role,
  };

  const prisma = new PrismaClient();
  try {
    const result = await prisma.users.findUnique({
      where: {
        username: String(username),
      },
    });
    if (result !== null) {
      await prisma.$disconnect();
      return res.status(400).json({ error: "user already exists" });
    }
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(500).json({ error: "something went wrong" });
  }

  try {
    const result = await prisma.users.create({
      data: {
        username: user.username,
        password: user.password,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(500).json({ error: "unable to create user" });
  }

  const sessionid = randomUUID();
  const sess = createSessionJWT(
    username,
    user.role,
    String(process.env.SESSION_SIGNING_KEY),
    String(process.env.SESSION_LENGTH)
  );
  res.setHeader("Set-Cookie", `cronussession=${sess}; HttpOnly; Secure`);

  await prisma.$disconnect();
  return res
    .status(201)
    .json({ success: `successfully signed up user ${user.username}` });
};

async function createUser(req: NextApiRequest, res: NextApiResponse) {}
