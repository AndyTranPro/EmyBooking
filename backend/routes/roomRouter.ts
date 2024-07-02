import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
} from "../controllers/roomController";
import { getSingleProductReviews } from "../controllers/reviewController";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/full-auth";

import { Router } from "express";
const router = Router();

router
  .route("/")
  .get([authenticateUser], getAllRooms)
  .post([authenticateUser, authorizePermissions("admin")], createRoom);

router
  .route("/:id")
  .get(getSingleRoom)
  .delete([authenticateUser, authorizePermissions("admin")], deleteRoom)
  .patch([authenticateUser, authorizePermissions("admin")], updateRoom);

router.route("/:id/reviews").get(getSingleProductReviews);

export { router as roomRouter };
