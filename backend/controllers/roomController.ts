import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Room } from "../models/Room";
import { BadRequestError } from "../errors";
import { mongooseRoomI, tokenUserI } from "../types";
import { availableBetweenQuery } from "../queries/availableBetweenQuery";
const ROOM_TYPES = ["meeting room", "normal", "hot desk", "staff room"];
export const userToRoomTypesMap = {
  admin: ROOM_TYPES,
  cse_staff: ["meeting room", "staff room", "normal"],
  non_cse_staff: ["meeting room", "normal"],
  hdr_student: ["hot desk", "normal"],
};

const createRoom = async (
  { body, user }: { body: mongooseRoomI; user: tokenUserI },
  res: Response
) => {
  const room = await Room.create({ ...body });
  res.status(StatusCodes.CREATED).json({ room });
};
// avaiableBetween query param seems to work???
const getAllRooms = async (
  { user: { type }, query: { level, sort, availableBetween } }: Request,
  res: Response
) => {
  interface queryObjectType {
    [k: string]: any;
    level?: number;
  }
  const queryObject: queryObjectType = {
    $or: [
      ...userToRoomTypesMap[type].map((r: string) => ({
        type: r,
      })),
    ],
  };
  let result;
  if (availableBetween) {
    const [start, end] = (availableBetween as string).split(",");

    result = availableBetweenQuery(start, end);
  }
  if (level) queryObject.level = Number(level);
  if (sort) sort = (sort as string).split(",").join(" ");

  if (result) result = result.match(queryObject).sort(sort || "name");
  else {
    result = Room.find(queryObject).sort(sort || "name");
  }

  // do sort and query param operations after aggregarion pipeline
  result = await result;
  res.status(StatusCodes.OK).json({ count: result.length, rooms: result });
};
const getSingleRoom = async (
  { params: { id: roomId } }: Request,
  res: Response
) => {
  const room = await Room.findOne({ _id: roomId });

  if (!room) throw new BadRequestError(`There is no room with id ${roomId}`);

  res.status(StatusCodes.OK).json({ room });
};

const updateRoom = async (
  { body, params: { id: roomId } }: Request,
  res: Response
) => {
  const updatedRoom = await Room.findOneAndUpdate({ _id: roomId }, body, {
    new: true,
    runValidators: true,
  });

  if (!updatedRoom) throw new BadRequestError(`No room with id ${roomId}`);

  res.status(StatusCodes.OK).json({ updatedRoom });
};
const deleteRoom = async (
  { params: { id: roomId } }: Request,
  res: Response
) => {
  const roomToDelete = await Room.findById(roomId);
  if (!roomToDelete) throw new BadRequestError(`No product with id ${roomId}`);

  await roomToDelete.deleteOne();
  res.status(StatusCodes.OK).json({ success: "product deleted" });
};

export { createRoom, getAllRooms, getSingleRoom, updateRoom, deleteRoom };
