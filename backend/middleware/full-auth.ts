import { NextFunction, Request, Response } from "express";
import { isTokenValid } from "../utils/jwt";
import { UnauthenticatedError, UnauthorizedError } from "../errors";
import type { tokenUserI } from "../types";

const authenticateUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.signedCookies.token)
    throw new UnauthenticatedError("Authentication invalid");

  try {
    const {
      email,
      type,
      name,
      zid,
      userId,
      hasNotificationEmail,
      hasConfirmationEmail,
    } = isTokenValid(req.signedCookies.token) as tokenUserI;
    // Attach the user and his permissions to the req object
    req.user = {
      email,
      type,
      name,
      zid,
      userId,
      hasConfirmationEmail,
      hasNotificationEmail,
    };

    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};

const authorizePermissions =
  (...allowedRoles: string[]) =>
  ({ user: { type } }: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(type))
      throw new UnauthorizedError("Access Forbiden");

    next();
  };

export { authenticateUser, authorizePermissions };
