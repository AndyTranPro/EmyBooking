import moment from "moment";
import { Booking } from "../models/Booking";

export const bookingsNotCheckedInQuery = (start: string, end: string) =>
  Booking.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "rooms",
        localField: "room",
        foreignField: "_id",
        as: "room",
      },
    },
    { $unwind: "$room" },
    {
      $match: {
        isCheckedIn: false,
        start: { $lte: new Date(end) },
        end: {
          $gte: new Date(start),
          $lte: new Date(moment().add(10, "hours").format()),
        },
      },
    },
  ]);
// Booking.find({
//   isCheckedIn: false,
//   start: { $lte: new Date(end) },
//   // transforming a moment date to js date does not yield expected result
//   // because it zeroes the utc format, so
//   // this clusterfuck is there for $lt
//   end: {
//     $gte: new Date(start),
//     // dumb way to get current date
//     $lt: new Date(moment().add(10, "hours").format()),
//   },
// });
