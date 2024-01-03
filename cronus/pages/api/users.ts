import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

import canReq, { ROLE_JWT } from "@/hooks/serverSide/auth";
import { compare, hash } from "bcrypt";
import { PrivledgedSyncDevicesWithSaaS } from "@/hooks/serverSide/devices";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const validU = await canReq(req, res, "user");
  const validM = await canReq(req, res, "mobile");
  const validA = await canReq(req, res, "admin");

  if (req.method === "GET") {
    if (!validU) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return getUsers(req, res);
  }

  if (req.method === "DELETE") {
    if (!validA) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return deleteUser(req, res);
  }

  if (req.method === "PATCH") {
    if (!validM) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return updateUser(req, res);
  }

  return res.status(405).json({ error: `${req.method} not supported` });
};

function buildUserQuery(
  username: string | string[] | undefined,
  role: string | string[] | undefined
) {
  if (username && role) {
    return {
      where: {
        username: String(username),
        role: String(role),
      },
      orderBy: {
        created_at: "asc",
      },
      select: {
        username: true,
        role: true,
        alertsenabled: true,
        displayname: true,
        deviceid: true,
      },
    };
  }

  if (username && !role) {
    return {
      where: {
        username: String(username),
      },
      orderBy: {
        created_at: "asc",
      },
      select: {
        username: true,
        role: true,
        displayname: true,
        alertsenabled: true,
        deviceid: true,
      },
    };
  }
  if (!username && role) {
    return {
      where: {
        role: String(role),
      },
      orderBy: {
        created_at: "asc",
      },
      select: {
        username: true,
        role: true,
        displayname: true,
        alertsenabled: true,
        deviceid: true,
      },
    };
  }

  return {
    select: {
      username: true,
      role: true,
      displayname: true,
      alertsenabled: true,
      deviceid: true,
    },
  };
}

async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  let { username, role } = req.query;
  let Q = buildUserQuery(username, role) as any;

  const prisma = new PrismaClient();
  try {
    const pull = await prisma.users.findMany(Q);
    await prisma.$disconnect();
    if (pull === null) {
      return res.status(404).json([]);
    }
    return res.status(200).json(pull);
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    return res.status(404).json({ error: `none found` });
  }
}

async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
  let { username } = req.query;

  if (username === undefined) {
    return res.status(400).json({ error: `bad request. no username attached` });
  }

  const prisma = new PrismaClient();
  try {
    const result = await prisma.users.delete({
      where: {
        username: String(username),
      },
    });
    console.log(`successfully deleted user ${username}`);
    await prisma.$disconnect();
    await PrivledgedSyncDevicesWithSaaS();

    return res
      .status(200)
      .json({ message: `${username} successfully deleted` });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();

    return res.status(404).json({ message: `${username} not found` });
  }
}

function canUpdateUser(token: ROLE_JWT, request: string) {
  if (token.role === "admin") return true;
  if (token.username === request) return true;

  return false;
}

async function updateUser(req: NextApiRequest, res: NextApiResponse) {
  let { username, displayname, password, newpassword, alerts } = req.query;

  if (!username || !displayname) {
    return res.status(400).json({ error: "bad request, missing variables" });
  }

  let token = await canReq(req, res, "mobile");

  if (!token || !canUpdateUser(token, String(username))) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const prisma = new PrismaClient();

  interface USERUPDATE {
    displayname: string;
    password?: string;
    alertsenabled?: boolean;
  }

  let where: USERUPDATE = {
    displayname: String(displayname),
    alertsenabled: alerts == "true" ? true : false,
  };
  let passwordMatch = false;

  if (password !== undefined && newpassword !== undefined) {
    try {
      const result = await prisma.users.findFirst({
        where: {
          username: String(username),
        },
      });
      if (result === null) {
        await prisma.$disconnect();
        return res.status(403).json({ error: "Forbidden" });
      }

      passwordMatch = await compare(String(password), result.password);
      if (!passwordMatch) {
        await prisma.$disconnect();
        return res.status(403).json({ error: "Forbidden" });
      }
    } catch (error) {
      await prisma.$disconnect();
      return res.status(500).json({ error: "something went wrong" });
    }
  }

  const hashedPassword = await hash(String(newpassword), 10);

  if (passwordMatch) {
    where.password = String(hashedPassword);
  }

  try {
    const result = await prisma.users.update({
      where: {
        username: String(username),
      },
      data: where,
    });
    console.log(`successfully updated user ${username}`);
    await prisma.$disconnect();
    await PrivledgedSyncDevicesWithSaaS();

    return res.status(201).json({ success: `updated user ${username}` });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(500).json({ error: "something went wrong" });
  }
}
