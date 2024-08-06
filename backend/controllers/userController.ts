import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/User";
import { BadRequestError, UnauthenticatedError } from "../errors";
import {
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
} from "../utils";

const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.find({});

  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async ({ params: { id } }: Request, res: Response) => {
  const user = await User.findOne({
    _id: id,
  });

  if (!user) throw new BadRequestError(`No user with id ${id}`);

  // checkPermissions(req.user, user._id.toString());

  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async ({ user }: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ user });
};

const updateUserPassword = async (
  { body: { oldPassword, newPassword }, user: { email } }: Request,
  res: Response
) => {
  if (!oldPassword || !newPassword)
    throw new BadRequestError("both new and old password must be provided");

  const user = (await User.findOne({ email }))!;

  // const isPasswordmatch = await user.comparePassword(oldPassword);

  // if (!isPasswordmatch)
  //   throw new UnauthenticatedError(
  //     "old password does not match users password"
  //   );

  // user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ success: true });
};

const updateUser = async (
  { body, user: { userId } }: Request,
  res: Response
) => {
  const updatedUser = (await User.findOneAndUpdate(
    { _id: userId },
    { ...body },
    {
      new: true,
      runValidators: true,
    }
  ))!;
  const tokenUser = createTokenUser(updatedUser);

  attachCookiesToResponse(res, tokenUser);

  res.status(StatusCodes.OK).json({ updatedUser });
};

export {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
