import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { IV, encrypt } from "@/hooks/serverSide/encryption";
import canReq, { ROLE_JWT } from "@/hooks/serverSide/auth";
import { hash } from "bcrypt";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const prisma = new PrismaClient();

  try {
    const result = await prisma.users.findMany();

    if (result.length !== 0) {
      await prisma.$disconnect();
      return res.status(200).json({ status: `ok` });
    }

    const created_at = Math.floor(Date.now() / 1000);
    const hashedPassword = await hash(
      String(process.env.ADMIN_DEFAULT_PASSWORD),
      10
    );
    const createdAdmin = await prisma.users.create({
      data: {
        username: "admin",
        password: hashedPassword,
        role: "admin",
        displayname: "admin",
        created_at: created_at,
      },
    });
    await prisma.$disconnect();

    return res
      .status(201)
      .json({ success: `successfully created initial admin user` });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(500).json({ error: "something went wrong" });
  }
};
