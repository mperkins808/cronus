import { PrismaClient } from "@prisma/client";
import { getSessionFromDB } from "./sessiondb";
import Cookies from "cookies";
import { NextApiRequest, NextApiResponse } from "next";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createSessionJWT } from "../sessions";

// ensures a request is authorized

export interface ROLE_JWT {
  username: string;
  role: string;
  exp: number;
}

export default async function canReq(
  req: NextApiRequest,
  res: NextApiResponse,
  requires: string
) {
  const cookies = new Cookies(req, res);
  const sessToken = cookies.get("cronussession");

  let username = "";
  let role = "";
  let token: ROLE_JWT = {
    username: "",
    role: "",
    exp: 1,
  };

  if (!sessToken) return false;
  try {
    const tok = jwt.verify(
      sessToken,
      String(process.env.SESSION_SIGNING_KEY)
    ) as JwtPayload;
    username = tok.username;
    role = tok.role;
    token = {
      username: username,
      role: role,
      exp: Number(tok.exp),
    };
  } catch (error) {
    console.error(error);
    return false;
  }

  const isActive = await isActiveUser(username);

  if (!isActive) return false;

  if (process.env.SESSION_MOBILE_AUTO_RENEW) {
    const sess = createSessionJWT(
      username,
      role,
      String(process.env.SESSION_SIGNING_KEY),
      String(process.env.SESSION_LENGTH)
    );
    res.setHeader("Set-Cookie", `cronussession=${sess}; Path=/;`);
  }

  if (role === "admin") return token;

  if ((role === "user" && requires === "user") || requires === "mobile")
    return token;

  if (role === "mobile" && requires === "mobile") return token;

  return false;
}

async function isActiveUser(username: string) {
  const prisma = new PrismaClient();
  try {
    const pull = await prisma.users.findUnique({
      where: {
        username: username,
      },
    });
    await prisma.$disconnect();
    if (pull === null) {
      return false;
    }
    return true;
  } catch (error) {
    await prisma.$disconnect();
    return false;
  }
}
