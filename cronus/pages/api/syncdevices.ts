import canReq from "@/hooks/serverSide/auth";
import { GetMobileDevices } from "@/hooks/serverSide/devices";
import { getapikey } from "@/hooks/serverSide/retrieveapitoken";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function SyncDevices(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const validU = await canReq(req, res, "user");

  if (!validU) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "GET") {
    return FetchSyncedDevices(req, res);
  }
  if (req.method === "POST") {
    return SyncDevicesWithSaaS(req, res);
  }
}

async function SyncDevicesWithSaaS(req: NextApiRequest, res: NextApiResponse) {
  console.log("syncing devices");
  const devices = await GetMobileDevices();
  if (!devices) {
    console.error("tried to sync devices but no valid devices to sync");
    return res.status(400).json({ error: "no valid devices to sync" });
  }
  const apikey = await getapikey();
  if (!apikey) {
    console.error("API key is not in database");
    return res.status(403).json({ error: "api key not found" });
  }

  try {
    const Auth = {
      headers: {
        Authorization: `Bearer ${apikey}`,
      },
    };

    const resp = await axios.post(
      `${process.env.ADMIN_CRONUS_SAAS_URL}/api/device`,
      devices,
      Auth
    );
    console.log(resp.data);
    return res.status(resp.status).json(resp.data);
  } catch (error: any) {
    console.error(`failed to sync devices. error : ${error}`);
    return res.status(error.response?.status).json(error.response?.data);
  }
}

async function FetchSyncedDevices(req: NextApiRequest, res: NextApiResponse) {
  console.log("fetching synced devices");
  const apikey = await getapikey();
  if (!apikey) {
    console.error("API key is not in database");
    return res.status(403).json({ error: "api key not found" });
  }
  try {
    const Auth = {
      headers: {
        Authorization: `Bearer ${apikey}`,
      },
    };
    const resp = await axios.get(
      `${process.env.ADMIN_CRONUS_SAAS_URL}/api/device`,
      Auth
    );
    if (resp.status !== 200) {
      console.error("no devices found in cronus saas");
    }
    return res.status(resp.status).json(resp.data);
  } catch (error: any) {
    console.error(`error fetching devices from saas. error : ${error}`);
    return res.status(error.response?.status).json(error.response?.data);
  }
}
