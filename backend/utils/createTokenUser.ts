// when getting user straight from database
import type { userDB_I } from "../types";

export const createTokenUser = (user: userDB_I) => {
  return {
    type: user.type,
    zid: user.zid,
    email: user.email,
    name: user.name,
    userId: user._id.toString(),
  };
};
