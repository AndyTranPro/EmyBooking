import mongoose, { Schema, model } from "mongoose";
import { Model } from "mongoose";
import type { mongooseRoomI, mongooseRoomMethodsI } from "../types";

type RoomModel = Model<
  mongooseRoomI,
  Record<string, never>,
  mongooseRoomMethodsI
>;

const roomSchema = new Schema<mongooseRoomI, RoomModel, mongooseRoomMethodsI>({
  name: {
    type: String,
    required: [true, "an room must have a name"],
  },
  size: {
    type: Number,
    required: [true, "an room must have a size"],
  },
  type: {
    type: String,
    required: [true, "an room must have a type"],
  },
  level: {
    type: Number,
    required: [true, "an room must have a level"],
    min: 1,
    max: 5,
  },
});
export const Room = model<mongooseRoomI, RoomModel>("Room", roomSchema);
