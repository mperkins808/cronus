import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { getapikey } from "./retrieveapitoken";
import axios from "axios";

export interface MOBILE_DEVICES_TO_SASS_REQUEST {
  name: string | null;
  uuid: string | null;
  alerts_enabled: boolean | null;
}
export async function GetMobileDevices() {
  const prisma = new PrismaClient();

  try {
    const devices = await prisma.users.findMany({
      where: {
        role: "mobile",
      },
    });
    await prisma.$disconnect();

    let result: MOBILE_DEVICES_TO_SASS_REQUEST[] = [];
    for (let i = 0; i < devices.length; i++) {
      if (!devices[i].deviceid) continue;

      result.push({
        name: devices[i].displayname
          ? devices[i].displayname
          : devices[i].username,
        uuid: devices[i].deviceid,
        alerts_enabled: devices[i].alertsenabled,
      });
    }

    return result;
  } catch (error) {
    console.error(`failed to retrieve mobile devices. error : ${error}`);
    await prisma.$disconnect();
    return null;
  }
}

// should be run within context of API endpoint
export async function PrivledgedSyncDevicesWithSaaS() {
  console.log("using server priviledge to sync devices");
  const devices = await GetMobileDevices();
  const apikey = await getapikey();

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
    if (resp.status !== 200) return false;
    return true;
  } catch (error: any) {
    console.error(`failed to sync devices. error : ${error}`);
    return false;
  }
}
