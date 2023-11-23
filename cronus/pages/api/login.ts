import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'
import { hash, compare } from 'bcrypt';
import { createSessionJWT } from '@/hooks/sessions';
import { randomUUID } from 'crypto';
import { storeSessionInDB } from '@/hooks/serverSide/sessiondb';


interface USER {
    username : string, 
    password : string, 
    role     : string
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let {username, password} = req.query
    username = String(username)
    password = String(password)

    if (req.method !== "GET") {
        return res.status(405).json({error : `${req.method} not supported`})
    }

    if (username === undefined || password === undefined) {
        return res.status(403).json({error: "Forbidden"})
    }


    const prisma = new PrismaClient() 
    try {
        const result = await prisma.users.findUnique({
            where: {
                username : String(username)
            }
        })
        if (result === null) {
            await prisma.$disconnect()
            return res.status(403).json({error: "Forbidden"})
        }
        const passwordMatch = await compare(password, result.password);

        if (!passwordMatch) {
            await prisma.$disconnect()
            return res.status(403).json({error: "Forbidden"})
        }
        
        const sessionid = randomUUID()
        const sess = createSessionJWT(username, result.role, String(process.env.SESSION_SIGNING_KEY), String(process.env.SESSION_LENGTH ))

        res.setHeader('Set-Cookie', `cronussession=${sess}; Path=/; Secure`);

        await prisma.$disconnect()
        return res.status(200).json({success : `successfully logged in user ${username}`})

    } catch (error)  {
        console.error(error)
        await prisma.$disconnect()
        return res.status(403).json({error: "Forbidden"})
    }


};

