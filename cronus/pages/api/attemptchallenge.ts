import canReq from "@/hooks/serverSide/auth";
import { NextApiRequest, NextApiResponse } from "next";
import cache from "memory-cache";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { createSessionJWT, validateJWT } from "@/hooks/sessions";
import { PrivledgedSyncDevicesWithSaaS } from "@/hooks/serverSide/devices";

const ONE_SECOND = 1000;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `${req.method} not supported` });
  }

  if (Boolean(process.env.ADMIN_MOBILE_ALLOW_ANON) === true) {
    console.warn(
      "ADMIN_MOBILE_ALLOW_ANON set to true. creating anon mobile user"
    );
    return createMobileAnonUser(req, res);
  }
  return createMobileUser(req, res);
};

async function createMobileUser(req: NextApiRequest, res: NextApiResponse) {
  let { id, passcode, deviceid } = req.query;

  if (!id || !passcode) {
    return res.status(403).json({ error: "bad request" });
  }

  const jwt = validateJWT(String(id), String(process.env.SESSION_SIGNING_KEY));
  if (!jwt) {
    return res.status(403).json({ error: "Forbidden" });
  }

  id = jwt.id;

  const cached = cache.get(id);

  if (!cached) {
    console.log(`challenge rejected because ${id} not found in cache`);
    return res.status(403).json({ error: "Forbidden" });
  }

  if (cached !== passcode) {
    console.log(
      `challenge rejected because passcode ${passcode} did not match value in cache`
    );
    return res.status(403).json({ error: "Forbidden" });
  }

  if (deviceid) {
    return addMobileToDB(req, res, String(id), String(deviceid));
  }

  return addMobileToDB(req, res, String(id), undefined);
}

async function createMobileAnonUser(req: NextApiRequest, res: NextApiResponse) {
  let { deviceid } = req.query;
  return addMobileToDB(req, res, "none", String(deviceid));
}

async function addMobileToDB(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  deviceid: string | undefined
) {
  // All is good, create a user
  cache.del(id);
  const prisma = new PrismaClient();

  const mobileid = randomUUID();
  const username = `mobile device ${mobileid}`;
  try {
    const result = await prisma.users.create({
      data: {
        password: "",
        username: username,
        role: "mobile",
        deviceid: deviceid,
        alertsenabled:
          process.env.ALERTING_DEFAULT_FOR_DEVICE === "true" ? true : false,
      },
    });
    const sess = createSessionJWT(
      username,
      result.role,
      String(process.env.SESSION_SIGNING_KEY),
      String(process.env.SESSION_LENGTH)
    );
    await PrivledgedSyncDevicesWithSaaS();
    res.setHeader("Set-Cookie", `cronussession=${sess}; Path=/;`);
    await prisma.$disconnect();
    return res.status(201).json({ success: `${username} created` });
  } catch (error) {
    console.error(error);
    console.error(`failed to create mobile user: ${username}`);
    await prisma.$disconnect();
    return res.status(500).json({ error: "something went wrong" });
  }
}

function genPasscode() {
  const min = 100000; // Smallest 6-digit number
  const max = 999999; // Largest 6-digit number

  // Generate a random number between min and max (inclusive)
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  // Convert the random number to a string
  const randomString = randomNumber.toString();
  return randomString;
}
