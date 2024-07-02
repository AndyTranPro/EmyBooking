import { Date, Types } from "mongoose";
import { singleOrderItemSchema } from "./models/Order";
import { StringifyOptions } from "querystring";

interface mongooseUserI {
  type: "cse_staff" | "non_cse_staff" | "hdr_student" | "admin";
  zid: string;
  name: string;
  email: string;
  faculty: string;
  school: string;
  title: string | null;
  role: string | null;
}
interface userDB_I extends mongooseUserI {
  _id: Types.ObjectId;
}
interface loginBodyI {
  email: string;
}

interface errorObjectI {
  message: string;
}

interface tokenUserI {
  type: "cse_staff" | "non_cse_staff" | "hdr_student" | "admin";
  zid: string;
  email: string;
  name: string;
  userId: string;
}
interface mongooseUserMethodsI {
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}
interface mongooseRoomI {
  type: "meeting room" | "hot desk" | "staff room" | "normal room";
  size: number;
  name: string;
  level: number;
}
interface mongooseBookingI {
  user: Types.ObjectId;
  room: Types.ObjectId;
  start: Date;
  end: Date;
  duration: number;
  description: String;
  isOverrided: boolean;
  isRequest: boolean;
  isCheckedIn: boolean;
}
interface mongooseBookingMethods {}
interface mongooseProductI {
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  company: string;
  colors: string[];
  featured: boolean;
  freeShipping: boolean;
  inventory: number;
  averageRating: number;
  user: Types.ObjectId;
  numOfReviews: number;
}

interface mongooseReviewI {
  rating: number;
  title: string;
  comment: string;
  user: Types.ObjectId;
  product: Types.ObjectId;
}
interface mongooseReviewMethodsI {}
interface mongooseProductMethodsI {}
interface fileI {
  image: {
    mv: (path: string) => Promise<boolean>;
    name: string;
    size: number;
    mimetype: string;
    tempFilePath: string;
  };
}
interface mongooseOrderI {
  tax: number;
  shippingFee: number;
  total: number;
  orderItems: (typeof singleOrderItemSchema)[];
  status: string;
  user: Types.ObjectId;
  clientSecret: string;
  paymentIntentId: string;
  subTotal: number;
}
interface cartItemI {
  name: string;
  price: number;
  image: string;
  amount: number;
  product: Types.ObjectId;
}

interface mongooseOrderMethodsI {}
interface mongooseRoomMethodsI {}

export type {
  fileI,
  loginBodyI,
  errorObjectI,
  mongooseUserI,
  mongooseUserMethodsI,
  userDB_I,
  tokenUserI,
  mongooseProductI,
  mongooseProductMethodsI,
  mongooseReviewI,
  mongooseReviewMethodsI,
  mongooseOrderI,
  mongooseOrderMethodsI,
  cartItemI,
  mongooseRoomI,
  mongooseRoomMethodsI,
  mongooseBookingI,
  mongooseBookingMethods,
};
