import { UnauthorizedError } from "../errors";
import { tokenUserI } from "../types";
export const checkPermissions = (
  { userId, type }: tokenUserI,
  resourceUserId: string
) => {
  if (userId === resourceUserId || type === "admin") return;

  throw new UnauthorizedError("user is not authorised to access this route");
};
