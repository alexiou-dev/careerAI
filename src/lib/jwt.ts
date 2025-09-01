import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret"; // move to .env

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" }); // 7-day expiry
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}
