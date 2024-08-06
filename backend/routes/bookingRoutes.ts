import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getSingleBooking,
  getCurrentUserBookings,
  sendFeedback,
  overrideBooking,
  checkInBooking,
  approveBookingRequest,
  denyBookingRequest,
  getUsageReport,
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
router.route("/usageReport").post(getUsageReport);

router.route("/sendFeedback").post(sendFeedback);
router
  .route("/:id/overrideBooking")
  .patch([authorizePermissions("admin")], overrideBooking);
router.route("/:id/checkIn").patch(checkInBooking);
router
  .route("/:id/approveRequest")
  .patch([authorizePermissions("admin")], approveBookingRequest);
router
  .route("/:id/denyRequest")
  .patch([authorizePermissions("admin")], denyBookingRequest);

router.route("/:id").get(getSingleBooking).delete(deleteBooking);
router.route("/:id/reviews").get(getSingleProductReviews);

export { router as bookingRouter };
