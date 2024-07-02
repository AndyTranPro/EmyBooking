import {
  createReview,
  deleteReview,
  getAllReviews,
  getSingleReview,
  updateReview,
} from "../controllers/reviewController";

import { authenticateUser } from "../middleware/full-auth";

import { Router } from "express";
const router = Router();

router.route("/").get(getAllReviews).post(authenticateUser, createReview);

router
  .route("/:id")
  .get(getSingleReview)
  .delete(authenticateUser, deleteReview)
  .patch(authenticateUser, updateReview);

export { router as reviewRouter };
