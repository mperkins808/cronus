import canReq from "@/hooks/serverSide/auth";
import { NextApiRequest, NextApiResponse } from "next";
import cache from "memory-cache";
import { randomUUID } from "crypto";
import { sign } from "jsonwebtoken";

const ONE_SECOND = 1000;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const valid = await canReq(req, res, "admin");

  if (!valid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const passcode = genPasscode();
  const id = `${randomUUID()}-${randomUUID()}`;
  //  expires in 1 minute
  const exp = 60;

  const token = sign({ id: id }, String(process.env.SESSION_SIGNING_KEY), {
    expiresIn: exp,
  });

  const payload = {
    passcode: passcode,
    id: token,
    exp: exp,
  };
  console.debug(`challenge created.`);
  cache.put(id, passcode, ONE_SECOND * 60);
  return res.status(200).json(payload);
};

function genPasscode() {
  const min = 100000;
  const max = 999999;

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  const randomString = randomNumber.toString();
  return randomString;
}
