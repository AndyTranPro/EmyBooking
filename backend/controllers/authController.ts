import { StatusCodes } from "http-status-codes";
import { User } from "../models/User";
import { BadRequestError, UnauthenticatedError } from "../errors";
import { attachCookiesToResponse } from "../utils";
import { Request, Response } from "express";
import { createTokenUser } from "../utils";
import type { loginBodyI } from "../types";

const login = async (
  { body: { email } }: { body: loginBodyI },
  res: Response
) => {
  if (!email)
    throw new BadRequestError("both email and password must be provided");

  const user = await User.findOne({ email });

  if (!user) throw new UnauthenticatedError("email was not found");

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse(res, tokenUser);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req: Request, res: Response) => {
  res.cookie("token", "logout", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out! " });
};

export { login, logout };
