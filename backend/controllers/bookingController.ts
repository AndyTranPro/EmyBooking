import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
} from "../errors";
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
import { sendConfirmationEmail } from "../utils/sendConfirmationEmail";
import { sendNotificationEmail } from "../utils/sendNotificationEmail";
import { sendFeedbackEmail } from "../utils/sendFeedbackEmail";
import { notifyAdminEmail } from "../utils/notifyAdminEmail";
import { sendOverrideEmail } from "../utils/sendOverrideEmail";
import { mostCommonUsersQuery } from "../queries/mostCommonUsersQuery";
import { bookingsNotCheckedInQuery } from "../queries/bookingsNotCheckedInQuery";
import { mostCommonlyBookedRoomsQuery } from "../queries/mostCommonlyBookedRoomsQuery";
import { roomsUsageQuery } from "../queries/roomsUsageQuery";
import { userCheckInUsageQuery } from "../queries/userCheckInUsageQuery";

// check that the booking doesent clash with any other bookings
// check that user and room exists

interface createBookingBody {
  room: string;
  duration: number;
  start: Date;
  description: string;
  user?: string;
  isRequest?: boolean;
}
interface queryObjectType {
  [k: string]: any;
  level?: number;
}

const createBooking = async (
  {
    body: { room: roomId, duration, start, description, user },
    user: { userId, type, email, hasConfirmationEmail, hasNotificationEmail },
  }: { body: createBookingBody; user: tokenUserI },
  res: Response
) => {
  if (user && type !== "admin")
    throw new UnauthenticatedError(
      `A ${type} is not authorized to book on behalf of someone else`
    );
  let userToBook;
  if (user) {
    userToBook = await User.findById(user)!;
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
  // checks if user is booking two different rooms at same timeframe or they are trying to
  // book room which is already booked
  const isClashing = await Booking.find({
    start: {
      $lt: end,
    },
    end: {
      $gt: start,
    },
    // if cse staff, then they can book different rooms at same time whereas hdr students cannot
    // book hot desks at same time
    $and: [
      {
        $or: [
          ...(type === "cse_staff"
            ? [{ room: roomId }]
            : [{ user: user ? user : userId }, { room: roomId }]),
        ],
      },
      // booking can only clash with a approved request however doesent clash with a pending or denied request at the
      // same timeframe
      { $or: [{ isRequest: false }, { isRequest: true, isApproved: true }] },
    ],

    isOverrided: false,
  });
  console.log(isClashing);
  if (isClashing.length)
    throw new BadRequestError(
      `Either this booking clashes with an already existing booking OR you cannot book two rooms within the same timeframe`
    );
  // if admin booking on behalf, then that person needs to get the emails (not the admin), otherwise its just the
  // person who created the booking
  const booking = await Booking.create({
    room: roomId,
    duration,
    start,
    user: user ? user : userId,
    end,
    description,
    // check if person is non_cse_staff as they can only make booking requests
    isRequest: type === "non_cse_staff",
  });
  // check if booking is a meeting room that is outside of normal working hours, so that the admin can be notified
  // @ts-ignore fix later
  const bookingStartHour = moment(booking.start).hour();

  // sending emails is disabled as usage is nearly 100% with email service
  if (
    roomExists.type === "meeting room" &&
    (bookingStartHour < 7 || bookingStartHour > 17)
  ) {
    // await notifyAdminEmail(booking._id.toString());
    // console.log("email sent");
  }

  if (hasConfirmationEmail)
    // await sendConfirmationEmail(
    //   userToBook?.email || email,
    //   booking._id.toString()
    // );
    // notification email currently broken
    // if (hasNotificationEmail)
    //   await sendNotificationEmail(
    //     userToBook?.email || email,
    //     booking._id.toString()
    //   );

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

const checkInBooking = async (
  { params: { id: bookingId }, user: { userId } }: Request,
  res: Response
) => {
  const booking = await Booking.findById(bookingId);
  if (!booking)
    throw new BadRequestError(`There is no booking with id ${bookingId}`);

  if (booking.user.toString() !== userId)
    throw new UnauthorizedError(
      `Only the user who made the booking can check in to it`
    );

  const updatedBooking = (await Booking.findOneAndUpdate(
    { _id: bookingId },
    { isCheckedIn: true },
    {
      new: true,
      runValidators: true,
    }
  ))!;
  res.status(StatusCodes.OK).json({ updatedBooking });
};
const overrideBooking = async (
  { params: { id: bookingId } }: Request,
  res: Response
) => {
  const booking = await Booking.findById(bookingId);
  if (!booking)
    throw new BadRequestError(`There is no booking with id ${bookingId}`);

  if (booking.isOverrided)
    throw new BadRequestError(
      `Booking with id ${bookingId} is already overrided`
    );

  const updatedBooking = (await Booking.findOneAndUpdate(
    { _id: bookingId },
    { isOverrided: true },
    {
      new: true,
      runValidators: true,
    }
  ))!;
  // notify the person who made the booking that its been overrided by an admin
  const personWhoBooked = (await User.findById(updatedBooking.user))!;

  // sending emails is disabled as usage is nearly 100% with email service
  // await sendOverrideEmail(personWhoBooked.email, booking._id.toString());
  res.status(StatusCodes.OK).json({ updatedBooking });
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
// ideally, an email should be sent notifying the user that their request has been approved or denied
const changeBookingRequestStatus = async (
  { params: { id: bookingId } }: Request,
  res: Response,
  isApprove: boolean
) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new BadRequestError(`No booking with id ${bookingId}`);

  if (!booking.isRequest)
    throw new BadRequestError(`booking ${bookingId} is not a request`);

  if (booking.isApproved !== null)
    throw new BadRequestError(
      `booking ${bookingId} has already been approved or denied`
    );

  booking.isApproved = isApprove;
  await booking.save();
  res.status(StatusCodes.OK).json({
    msg: `booking ${bookingId} successfully ${
      isApprove ? "Approved" : "Denied"
    }`,
  });
};

const approveBookingRequest = async (req: Request, res: Response) =>
  await changeBookingRequestStatus(req, res, true);

const denyBookingRequest = async (req: Request, res: Response) =>
  await changeBookingRequestStatus(req, res, false);

const sendFeedback = async (
  { body: { feedback }, user: { email } }: Request,
  res: Response
) => {
  // sending emails is disabled as usage is nearly 100% with email service
  // await sendFeedbackEmail(feedback, email);
  res
    .status(StatusCodes.OK)
    .json({ msg: `feedback sent to admin successfully!` });
};
// everything is between two dates to which it applies
const getUsageReport = async (
  { query: { start, end } }: { query: { start: string; end: string } },
  res: Response
) => {
  // list of bookings that havent been checked in
  const notCheckedIn = await bookingsNotCheckedInQuery(start, end);
  // most commonly booked rooms
  const mostCommonlyBookedRooms = await mostCommonlyBookedRoomsQuery(
    start,
    end
  );
  // get usage of rooms by percent
  const roomUsage = await roomsUsageQuery(start, end);

  const checkedInUsage = await userCheckInUsageQuery(start, end);

  //most common users
  const mostCommonUsers = await mostCommonUsersQuery(start, end);
  res.status(StatusCodes.OK).json({
    roomUsage,
    checkedInUsage,
    mostCommonlyBookedRooms,
    notCheckedIn,
    mostCommonUsers,
  });
};
export {
  getUsageReport,
  createBooking,
  getAllBookings,
  getSingleBooking,
  deleteBooking,
  getCurrentUserBookings,
  sendFeedback,
  overrideBooking,
  checkInBooking,
  approveBookingRequest,
  denyBookingRequest,
};
