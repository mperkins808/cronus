// checks for existence of API key in database

import canReq from "@/hooks/serverSide/auth";
import {
  deleteAPIKeyInDB,
  getapikey,
} from "@/hooks/serverSide/retrieveapitoken";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const validU = await canReq(req, res, "user");

  if (!validU) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "GET") {
    return APIKeyExists(req, res);
  }

  if (req.method === "DELETE") {
    return DeleteAPIKey(req, res);
  }

  return res.status(400).json({ error: "bad request" });
};

async function APIKeyExists(req: NextApiRequest, res: NextApiResponse) {
  console.log("validating API key exists");

  const key = await getapikey();
  if (!key) {
    console.log("API key not found");

    return res.status(404).json({ message: "API Key not found" });
  }
  console.log("API key found");
  return res.status(200).json({ message: "API Key found" });
}

async function DeleteAPIKey(req: NextApiRequest, res: NextApiResponse) {
  console.log("requesting to delete api key");
  const deleted = await deleteAPIKeyInDB();
  if (!deleted) {
    console.error("failed to delete key");
    return res.status(404).json({ message: "api key not found" });
  }
  console.log("api key has been deleted");
  return res.status(200).json({ message: "api key has been deleted" });
}
