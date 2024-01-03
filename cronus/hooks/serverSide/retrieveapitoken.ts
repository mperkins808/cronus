import { PrismaClient } from "@prisma/client";
import { IV, decrypt } from "./encryption";

export async function getapikey() {
  const prisma = new PrismaClient();

  try {
    const token = await prisma.saaSConnection.findFirst({
      where: { id: "apikey" },
    });
    if (!token) return null;
    // decrypt the value

    const decrypted = decrypt(
      token.value,
      Buffer.from(String(token.iv), "hex")
    );
    await prisma.$disconnect();
    return decrypted;
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return null;
  }
}

export async function deleteAPIKeyInDB() {
  const prisma = new PrismaClient();

  try {
    const res = await prisma.saaSConnection.delete({
      where: { id: "apikey" },
    });
    await prisma.$disconnect();

    if (!res) return false;

    return true;
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return false;
  }
}
