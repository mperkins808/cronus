import canReq from "@/hooks/serverSide/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const valid = await canReq(req, res, "mobile");
  if (!valid) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return res.status(200).json({ status: "healthy" });
};
