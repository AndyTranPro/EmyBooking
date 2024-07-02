import { Schema, model } from "mongoose";
import { Model } from "mongoose";
import type { mongooseOrderI, mongooseOrderMethodsI } from "../types";

type ReviewModel = Model<
  mongooseOrderI,
  Record<string, never>,
  mongooseOrderMethodsI
>;
export const singleOrderItemSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
});

const orderSchema = new Schema<
  mongooseOrderI,
  ReviewModel,
  mongooseOrderMethodsI
>(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    orderItems: [singleOrderItemSchema],

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "failed", "paid", "delivered", "cancelled"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "an order must have an associating user"],
    },
    clientSecret: {
      type: String,
      required: [true, "an order must contain a client secret"],
    },
    paymentIntentId: {
      type: String,
      required: [true, "an order must have a payment id"],
    },
  },
  { timestamps: true }
);
export const Order = model<mongooseOrderI, ReviewModel>("Order", orderSchema);
