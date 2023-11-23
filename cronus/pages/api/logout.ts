import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'
import { hash, compare } from 'bcrypt';
import { createSessionJWT } from '@/hooks/sessions';
import { randomUUID } from 'crypto';
import { storeSessionInDB } from '@/hooks/serverSide/sessiondb';
import canReq from '@/hooks/serverSide/auth';


export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
        return res.status(405).json({error : `${req.method} not supported`})
    }

    const valid = await canReq(req, res, "user")

    if (!valid) {
      return res.status(403).json({error: "Forbidden"})
    }

    res.setHeader('Set-Cookie', `cronussession=deleted; Path=/; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT`);
    return res.status(200).json({success : "ok"})  

};

