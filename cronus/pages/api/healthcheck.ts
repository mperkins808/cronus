import canReq from "@/hooks/serverSide/auth";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const validU = await canReq(req, res, "user");

  if (!validU) {
    return res.status(403).json({ error: "Forbidden" });
  }

  let { path, authheader } = req.query;
  path = path as string;
  authheader = authheader as string;

  const headers = { Authorization: authheader };

  console.debug(path);
  let code = 500;
  try {
    const resp = await axios.get(path, { headers: headers });
    code = resp.status;
  } catch (err: any) {
    if (err.response) {
      code = err.response.status;
    } else {
      code = 500;
    }
  }
  console.debug(`${path} had response ${code}`);
  res.status(code).json({ status: code });
};
