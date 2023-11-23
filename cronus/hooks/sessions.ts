import jwt, { sign, JwtPayload } from "jsonwebtoken";
import { randomUUID } from "crypto";

// Create a JWT session
export function createSessionJWT(
  username: string,
  role: string,
  key: string,
  exp: string
) {
  const payload = {
    username: username,
    role: role,
  };

  const token = sign(payload, key, {
    expiresIn: exp,
  });
  return token;
}

export function validateJWT(raw: string, key: string) {
  try {
    const tok = jwt.verify(raw, key) as JwtPayload;

    return tok;
  } catch (error) {
    console.error(`jwt expired`);
    return false;
  }
}
