import { StatusCodes } from "http-status-codes";
import { User } from "../models/User";
import {
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
} from "../errors";
import { attachCookiesToResponse } from "../utils";
import { Request, Response } from "express";
import { createTokenUser } from "../utils";
import { sendVerificationEmail } from "../utils/sendVerificationEmail";
import type { loginBodyI } from "../types";
import { randomBytes } from "crypto";

const register = async (
  { body: { email, password } }: Request,
  res: Response
) => {
  const userExists = await User.findOne({ email });
  if (!userExists)
    throw new BadRequestError("The email doesn't exist in the Database");

  if (userExists.isVerified)
    throw new BadRequestError("The user is already verified");

  if (!password) throw new BadRequestError("password must be given");

  const verificationToken = randomBytes(40).toString("hex");

  userExists.verificationToken = verificationToken;
  userExists.password = password;

  await userExists.save();
  await sendVerificationEmail(email, userExists.name, verificationToken);
  res.status(StatusCodes.CREATED).json({
    msg: `Success! Please check your email to verify the account`,
  });
};

// for development, if password is given then check that it matches
// and that the user is verified but if password
// isent given then log them in anyway despite if they are verified or not

const login = async (
  { body: { email, password } }: { body: loginBodyI },
  res: Response
) => {
  if (!email)
    throw new BadRequestError("both email and password must be provided");
  const user = await User.findOne({ email });

  if (!user) throw new UnauthenticatedError("email was not found");

  if (password) {
    if (!user.isVerified)
      throw new UnauthorizedError("Please verify your account");

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      throw new UnauthenticatedError("password doesn't match");
  }

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
const verifyEmail = async (
  {
    body: { email, verificationToken },
  }: { body: { email: string; verificationToken: string } },
  res: Response
) => {
  const user = await User.findOne({ email });
  if (!user) throw new UnauthenticatedError(`email doesn't exist`);
  if (user.verificationToken !== verificationToken)
    throw new UnauthenticatedError(`verification token is invalid`);
  user.isVerified = true;

  user.verificationToken = "";
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "email verified" });
};
export { login, logout, verifyEmail, register };
