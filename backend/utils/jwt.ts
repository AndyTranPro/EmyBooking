import { verify, sign } from "jsonwebtoken";
import { Response } from "express";
import type { tokenUserI } from "../types";
const isTokenValid = (candidateToken: string) => {
  const { JWT_SECRET } = process.env;
  const decoded = verify(candidateToken, JWT_SECRET as string);
  return decoded;
};
const generateToken = (payload: tokenUserI) => {
  const { JWT_SECRET, JWT_LIFETIME } = process.env;
  const token = sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_LIFETIME,
  });
  return token;
};

const attachCookiesToResponse = (res: Response, tokenUser: tokenUserI) => {
  const token = generateToken(tokenUser);

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

export { generateToken, isTokenValid, attachCookiesToResponse };
