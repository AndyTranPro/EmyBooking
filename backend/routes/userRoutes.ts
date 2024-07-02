import express from "express";
import { authorizePermissions } from "../middleware/full-auth";
import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} from "../controllers/userController";
const router = express.Router();

router.route("/").get(getAllUsers);

router.route("/showMe").get(showCurrentUser);

router.route("/updateUser").patch(updateUser);

router.route("/updateUserPassword").patch(updateUserPassword);

router.route("/:id").get(getSingleUser);

export { router as userRouter };
