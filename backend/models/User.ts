import { Schema, model } from "mongoose";
import { Model } from "mongoose";
import { isEmail } from "validator";
import type { mongooseUserI, mongooseUserMethodsI } from "../types";

type UserModel = Model<
  mongooseUserI,
  Record<string, never>,
  mongooseUserMethodsI
>;

const userSchema = new Schema<mongooseUserI, UserModel, mongooseUserMethodsI>({
  name: {
    type: String,
    required: [true, "name must be provided"],
    minlength: [5, "name must be longer than 5 characters"],
    maxlength: [50, "name must be shorter than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "email must be provided"],
    validate: {
      validator: (email: string) => isEmail(email),
      message: `please provide a valid email address`,
    },
    unique: true,
  },
  zid: {
    type: String,
    required: [true, "zid must be provided"],
    unique: true,
  },
  faculty: {
    type: String,
  },
  school: {
    type: String,
  },
  title: {
    type: String,
  },
  role: {
    type: String,
  },

  // password: {
  //   type: String,
  //   required: [true, "password must be provided"],
  //   minlength: [5, "password must be longer than 5 characters"],
  //   maxlength: [70, "password must be shorter than 70 characters"],
  // },
  type: {
    type: String,
    enum: ["cse_staff", "non_cse_staff", "hdr_student", "admin"],
    required: true,
  },
});
// userSchema.methods.comparePassword = function (candidatePassword: string) {
//   return compare(candidatePassword, this.password);
// };

// userSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   const salt = await genSalt(10);
//   this.password = await hash(this.password, salt);
// });

export const User = model<mongooseUserI, UserModel>("User", userSchema);
