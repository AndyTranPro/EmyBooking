import { Request, Response } from "express";
import { Review } from "../models/Review";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors";
import { Product } from "../models/Product";
import { checkPermissions } from "../utils";

const createReview = async (
  { body, user: { zid } }: Request,
  res: Response
) => {
  const { product: productId } = body;

  const isValidProduct = await Product.findById(productId);

  if (!isValidProduct)
    throw new BadRequestError(`No product with id: ${productId}`);

  // check if user already left a review for specified product (in-controller version as opposed to mongoose schema index methods)
  const hasAlreadyReviewed = await Review.findOne({
    product: productId,
    user: zid,
  });
  if (hasAlreadyReviewed)
    throw new BadRequestError(
      `User has already reviewed product with id: ${productId}`
    );
  //
  const review = await Review.create({
    ...body,
    user: zid,
  });
  res.status(StatusCodes.OK).json({ review });
};
const getAllReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find({})
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({ path: "user", select: "name email" });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};
const deleteReview = async (
  { user, params: { id: reviewId } }: Request,
  res: Response
) => {
  const candidateReview = await Review.findById(reviewId);

  if (!candidateReview)
    throw new BadRequestError(`No review with id ${reviewId}`);

  checkPermissions(user, candidateReview.user.toString());

  await candidateReview.deleteOne();

  res.status(StatusCodes.OK).json({ success: "review deleted successfully!" });
};

const updateReview = async (
  { params: { id: reviewId }, user, body: { rating, title, comment } }: Request,
  res: Response
) => {
  const candidateReview = await Review.findById(reviewId);

  if (!candidateReview)
    throw new BadRequestError(`No review with id ${reviewId}`);

  checkPermissions(user, candidateReview.user.toString());

  candidateReview.rating = rating;
  candidateReview.title = title;
  candidateReview.comment = comment;

  await candidateReview.save();

  res.status(StatusCodes.OK).json({ review: candidateReview });
};

const getSingleReview = async (
  { params: { id: reviewId } }: Request,
  res: Response
) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new BadRequestError(`No review with id ${reviewId}`);

  res.status(StatusCodes.OK).json({ review });
};

const getSingleProductReviews = async (
  { params: { id: productId } }: Request,
  res: Response
) => {
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

export {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
