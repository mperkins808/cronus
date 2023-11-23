import { PrismaClient } from '@prisma/client'

export async function storeSessionInDB(id: string, user: string) {


// Calculate the timestamp for 7 days from now
    const end = new Date();
    end.setDate(end.getDate() + Number(process.env.SESSION_STORAGE));
    const expiry = Math.floor(end.getTime() / 1000);

    const primsa = new PrismaClient()

    try {
        const result = await primsa.session.create({
            data:{
                id: id, 
                username: user,
                expiry: expiry
            }
        })
        return true 
    } catch (error) {
        console.error(error)
        return false 
    }
}

export async function getSessionFromDB(id: string) {
    const now = Math.floor(Date.now() / 1000);
    const primsa = new PrismaClient()

    try {
        const result = await primsa.session.findUnique({
            where : {
                id : id
            }
        })
        if (!result) {
            console.debug(`requested ${id} session in db not found`)
            await primsa.$disconnect()
            return null 
        }

        if (now > result.expiry) {
            console.debug(`found session ${id} but is expired`)
            await primsa.$disconnect()
            await deleteSessionInDB(id)
            return null
        }

        return result.username

    } catch (error) {
        console.error(error)
        await primsa.$disconnect()
        return null
    }
}

export async function deleteSessionInDB(id: string) {
    const primsa = new PrismaClient() 
    try {
        await primsa.session.delete({
            where: {
                id : id
            }
        })
        await primsa.$disconnect()
    } catch (error ) {
        console.error(error)
        await primsa.$disconnect()
    }
}
