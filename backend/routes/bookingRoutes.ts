import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getSingleBooking,
  getCurrentUserBookings,
  sendEmail,
} from "../controllers/bookingController";
import { getSingleProductReviews } from "../controllers/reviewController";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/full-auth";

import { Router } from "express";
const router = Router();

router.route("/").get(getAllBookings).post(createBooking);
router.route("/showAllMyBookings").get(getCurrentUserBookings);

router.route("/sendEmail").post(sendEmail);

router.route("/:id").get(getSingleBooking).delete(deleteBooking);
router.route("/:id/reviews").get(getSingleProductReviews);

export { router as bookingRouter };
