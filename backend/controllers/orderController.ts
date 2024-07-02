import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors";
import { Product } from "../models/Product";
import type { cartItemI } from "../types";
import { Stripe } from "stripe";
import { Order } from "../models/Order";
import { checkPermissions } from "../utils";

type createProductParam = {
  body: {
    tax: number;
    shippingFee: number;
    items: cartItemI[];
  };
  user: { userId: string };
};

const createOrder = async (
  {
    body: { tax, shippingFee, items: cartItems },
    user: { userId: user },
  }: createProductParam,
  res: Response
) => {
  //check if there are items in cart
  if (!cartItems || !cartItems.length)
    throw new BadRequestError("no cart items provided");

  if (!tax || !shippingFee)
    throw new BadRequestError("tax and shipping fee must be provided");

  const orderItems: cartItemI[] = [];
  let subTotal = 0;

  for (const { product: productId, amount } of cartItems) {
    const product = await Product.findById(productId);

    if (!product)
      throw new NotFoundError(`product with id: ${productId} does not exist`);

    const { name, price, image } = product;
    orderItems.push({ price, amount, name, image, product: productId });
    subTotal += price * amount;
  }
  const total = subTotal + tax + shippingFee;

  const { STRIPE_SECRET_KEY } = process.env;

  const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-04-10",
  });

  const { id: paymentIntentId, client_secret: clientSecret } =
    await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
    });
  const order = await Order.create({
    tax,
    shippingFee,
    total,
    subTotal,
    orderItems,
    user,
    clientSecret,
    paymentIntentId,
  });

  res.status(StatusCodes.CREATED).json({ order, clientSecret });
};

const getAllOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};
const getSingleOrder = async (
  { params: { id: orderId }, user }: Request,
  res: Response
) => {
  const order = await Order.findById(orderId);
  if (!order)
    throw new BadRequestError(`order with id ${orderId} does not exist`);

  checkPermissions(user, order.user.toString());

  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (
  { user: { zid } }: Request,
  res: Response
) => {
  const orders = await Order.find({ user: zid });

  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};
const updateOrder = async (
  { body: { paymentIntentId }, params: { id: orderId }, user }: Request,
  res: Response
) => {
  const order = await Order.findById(orderId);
  if (!order)
    throw new BadRequestError(`order with id ${orderId} does not exist`);

  checkPermissions(user, order.user.toString());

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

export {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
