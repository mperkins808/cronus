import crypto from "crypto"

//Encrypting text
export function encrypt(text: string, iv: Buffer) {
  try {
    const k = Buffer.from(String(process.env.DATABASE_ENCRYPTION_KEY), "hex")
    let cipher = crypto.createCipheriv('aes-256-cbc', k, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex') 
  }

  catch (error) {
    console.error(error)
    return null
  }
}

// Decrypting text
export function decrypt(text: string, iv: Buffer) {
  try {
    const k = Buffer.from(String(process.env.DATABASE_ENCRYPTION_KEY), 'hex')
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', k, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error(error)
    return null
  }

}

export function IV() {
  return crypto.randomBytes(16);
}

