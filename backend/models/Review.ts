import mongoose, { Schema, model } from "mongoose";
import { Model } from "mongoose";
import type { mongooseReviewI, mongooseReviewMethodsI } from "../types";
import { Product } from "./Product";
import { ObjectId } from "mongodb";
// type ReviewModel = Model<
//   mongooseReviewI,
//   Record<string, never>,
//   mongooseReviewMethodsI
// >;
interface ReviewModel
  extends Model<mongooseReviewI, {}, mongooseReviewMethodsI> {
  calculateAverageRating(productId: string): number;
}

const reviewSchema = new Schema<
  mongooseReviewI,
  ReviewModel,
  mongooseReviewMethodsI
>(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "a review must have a rating"],
    },
    title: {
      type: String,
      required: [true, "a review must have a title"],
      trim: true,
      maxlength: [1000, "a title cannot be longer than 100 characters "],
    },
    comment: {
      type: String,
      required: [true, "a review must have a comment"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A review must have an associated user"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "A review must have an associated product"],
    },
  },
  { timestamps: true }
);
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.static(
  "calculateProductRatingAndNumReviews",
  async function (productId: string) {
    const stats = await this.aggregate([
      {
        $match: {
          product: productId,
        },
      },
      {
        $group: {
          _id: null,
          numOfReviews: {
            $count: {},
          },
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);
    try {
      await Product.findByIdAndUpdate(productId, {
        numOfReviews: stats[0]?.numOfReviews || 0,
        averageRating: stats[0]?.averageRating || 0,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

reviewSchema.post("save", async function () {
  // @ts-expect-error just testing
  await this.constructor.calculateProductRatingAndNumReviews(this.product);
});

reviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    // @ts-expect-error just testing
    await this.constructor.calculateProductRatingAndNumReviews(this.product);
  }
);

export const Review = model<mongooseReviewI, ReviewModel>(
  "Review",
  reviewSchema
);
