import { Schema, model } from "mongoose";
import { Model } from "mongoose";
import type { mongooseProductI, mongooseProductMethodsI } from "../types";
import { Review } from "./Review";

type ProductModel = Model<
  mongooseProductI,
  Record<string, never>,
  mongooseProductMethodsI
>;

const productSchema = new Schema<
  mongooseProductI,
  ProductModel,
  mongooseProductMethodsI
>(
  {
    name: {
      type: String,
      required: [true, "a product must have a Name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    price: {
      type: Number,
      default: 0,
      required: [true, "a product must have a price"],
    },
    description: {
      type: String,
      required: [true, "a product must have a description"],
      maxlength: [1000, "description cannot be more than 1000 characters"],
    },
    image: { type: String, default: "/uploads/default_image.png" },
    category: {
      type: String,
      enum: ["office", "kitchen", "bedroom"],
      required: [true, "a product must have a category"],
    },
    company: {
      type: String,
      required: [true, "a product must have a company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: `the products company chosen: {VALUE} is not from one of those predefined`,
      },
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: [true, "a product must have colour(s)"],
    },
    featured: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    inventory: { type: Number, default: 15 },
    averageRating: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A product must have an associated user"],
    },
  },
  {
    timestamps:
      true /*toJSON: { virtuals: true }, toObject: { virtuals: true }*/,
  }
);
// virtual example
// productSchema.virtual("reviews", {
//   ref: "Review",
//   localField: "_id",
//   foreignField: "product",
//   justOne: false,
// });

productSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    // await Review.deleteMany({ product: this._id });
    await this.model("Review").deleteMany({ product: this._id });
  }
);
export const Product = model<mongooseProductI, ProductModel>(
  "Product",
  productSchema
);
