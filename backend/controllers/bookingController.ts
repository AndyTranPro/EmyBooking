import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors";
import { mongooseBookingI, tokenUserI } from "../types";
import { Room } from "../models/Room";
import { Booking } from "../models/Booking";
import { User } from "../models/User";
import { checkPermissions } from "../utils";
import { userToRoomTypesMap } from "./roomController";
import { createTransport, createTestAccount } from "nodemailer";
import sgMail from "@sendgrid/mail";
import { isIn } from "validator";
import { Types } from "mongoose";
import moment from "moment";

// check that the booking doesent clash with any other bookings
// check that user and room exists

interface createBookingBody {
  room: string;
  duration: number;
  start: Date;
  description: string;
  user?: string;
}
interface queryObjectType {
  [k: string]: any;
  level?: number;
}

const createBooking = async (
  {
    body: { room: roomId, duration, start, description, user },
    user: { userId, type },
  }: { body: createBookingBody; user: tokenUserI },
  res: Response
) => {
  if (user && type !== "admin")
    throw new BadRequestError(
      `A ${type} is not authorized to book on behalf of someone else`
    );
  if (user) {
    const userToBook = await User.findById(user)!;
    if (!userToBook) throw new BadRequestError(`user ${user} does not exist `);
    if (userToBook.type !== "cse_staff")
      throw new BadRequestError(`Admins can only book on behalf of CSE staff`);
  }
  // check that the user is able to book that type of room, we will do this by adding a 'whoCanBook' field in the room model which is a space
  // seperate list of types of users who can book it (e.g. ['hdr_student', 'cse_staff']), we'll do this later

  // check that room exists
  const roomExists = await Room.findById(roomId);

  if (!roomExists) throw new BadRequestError(`No room with id: ${roomId}`);

  // wanna add the duration hours to the start date to get the date range which the booking will be, thus
  // allowing us to check if there are any bookings of the same room within that date and if so, throw an error
  const end = moment(start).add(duration, "hours");

  const isClashing = await Booking.find({
    start: {
      $lt: end,
    },
    end: {
      $gt: start,
    },
    room: roomId,
  });

  if (isClashing.length)
    throw new BadRequestError(
      `This booking clashes with an already existing booking`
    );

  const booking = await Booking.create({
    room: roomId,
    duration,
    start,
    user: user ? user : userId,
    end,
    description,
  });
  res.status(StatusCodes.CREATED).json({ booking });
};
// check for 'active' bookings, that is, a booking from now to the future, not one that has already passes
const getCurrentUserBookings = async (
  { user: { userId }, query: { start: s, end: e, sort } }: Request,
  res: Response
) => {
  let queryObject: queryObjectType;
  if (s && e)
    queryObject = {
      start: {
        $gte: s,
      },
      end: {
        $lte: e,
      },
    };
  else queryObject = {};

  queryObject.user = userId;
  if (sort) sort = (sort as string).split(",").join(" ");
  const bookings = await Booking.find(queryObject)
    .populate({
      path: "room",
      select: "name size type",
    })
    .sort(sort || "-start");

  res.status(StatusCodes.OK).json({ count: bookings.length, bookings });
};

const getAllBookings = async (
  { query: { start: s, end: e, sort } }: Request,
  res: Response
) => {
  let queryObject: queryObjectType;
  if (s && e)
    queryObject = {
      start: {
        $gte: s,
      },
      end: {
        $lte: e,
      },
    };
  else {
    queryObject = {};
  }
  console.log(queryObject);
  // level filter doesent work right now since 'level' isent an attribute of a booking, some mongoose $loopup operations will have to
  // be done here, I'll do it later

  // if (level) queryObject.level = Number(level);
  if (sort) sort = (sort as string).split(",").join(" ");

  // for now, just get all bookings within timeperiod, irrespective of whether the user can actually see those rooms
  // (i.e. a hdr student cannot see meeting rooms but bookings for meeting rooms might show up in output)
  // fix this later with aggregation pipeline and/or $lookup mechanism in mongoose, not too big of a deal in the first sprint
  const bookings = await Booking.find(queryObject)
    .populate({
      path: "room",
      select: "name size type",
    })
    .populate({
      path: "user",
      select: "name email zid type",
    })
    .sort(sort || "-start");

  res.status(StatusCodes.OK).json({ count: bookings.length, bookings });
};
const getSingleBooking = async (
  { params: { id: bookingId } }: Request,
  res: Response
) => {
  const booking = await Booking.findOne({ _id: bookingId });

  if (!booking)
    throw new BadRequestError(`There is no room with id ${bookingId}`);

  res.status(StatusCodes.OK).json({ booking });
};

const deleteBooking = async (
  { params: { id: bookingId }, user }: Request,
  res: Response
) => {
  const bookingToDelete = await Booking.findById(bookingId);
  if (!bookingToDelete)
    throw new BadRequestError(`No booking with id ${bookingId}`);
  checkPermissions(user, bookingToDelete.user.toString());

  await bookingToDelete.deleteOne();
  res.status(StatusCodes.OK).json({ success: "booking deleted" });
};
const createEmailMessage = (
  email: string,
  booking: mongooseBookingI & {
    _id: Types.ObjectId;
  },
  isConfirmation: boolean
) => {
  let sendAt = undefined;
  if (!isConfirmation) {
    const start = String(booking.start);
    const before = moment(start).subtract(15, "minutes").valueOf();
    sendAt = before;
  }
  return {
    to: email, // Change to your recipient
    from: "m.arsalah003@gmail.com", // Change to your verified sender
    subject: isConfirmation
      ? `Confirmation for booking ${booking._id}`
      : `Reminder for booking ${booking._id}`,
    text: isConfirmation
      ? "Booking information"
      : "You have a booking in 15 minutes",
    html: JSON.stringify(booking),
    sendAt,
  };
};

const sendEmail = async (
  { body: { booking: bookingId, isConfirmation } }: Request,
  res: Response
) => {
  const { SENDGRID_API_KEY } = process.env;
  sgMail.setApiKey(SENDGRID_API_KEY as string);
  const booking = await Booking.findById(bookingId);

  if (!booking)
    throw new BadRequestError(`There is no booking with id ${bookingId}`);

  const user = (await User.findById(booking.user))!;

  const email = user.email;

  const msg = createEmailMessage(email, booking, Boolean(isConfirmation));
  const info = await sgMail.send(msg);
  res.status(StatusCodes.OK).json(info);
};

export {
  createBooking,
  getAllBookings,
  getSingleBooking,
  deleteBooking,
  getCurrentUserBookings,
  sendEmail,
};
