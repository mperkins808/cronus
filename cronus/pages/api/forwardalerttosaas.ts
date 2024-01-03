import { getapikey } from "@/hooks/serverSide/retrieveapitoken";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(
    "received alert request, forwarding to saas and returning response"
  );

  const apitoken = await getapikey();
  const Auth = {
    headers: {
      Authorization: `Bearer ${apitoken}`,
    },
  };

  try {
    if (req.method === "POST") {
      const resp = await axios.post(
        `${process.env.ADMIN_CRONUS_SAAS_URL}/api/alert`,
        req.body,
        Auth
      );
      return res.status(resp.status).json(resp.data);
    } else if (req.method === "GET") {
      const resp = await axios.get(
        `${process.env.ADMIN_CRONUS_SAAS_URL}/api/alert`,
        Auth
      );
      return res.status(resp.status).json(resp.data);
    } else {
      return res.status(400).json({ error: "Bad Request" });
    }
  } catch (error: any) {
    console.error(`failed to forward alert to saas. error : ${error}`);
    return res.status(error.response?.status).json(error.response?.data);
  }
};
