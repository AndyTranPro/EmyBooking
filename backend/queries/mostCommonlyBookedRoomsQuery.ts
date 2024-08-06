import { Room } from "../models/Room";

export const mostCommonlyBookedRoomsQuery = (start: string, end: string) =>
  Room.aggregate()
    .lookup({
      from: "bookings",
      localField: "_id",
      foreignField: "room",
      as: "bookings",
    })
    .unwind("$bookings")
    .match({
      "bookings.start": { $lte: new Date(end) },
      "bookings.end": { $gte: new Date(start) },
    })
    .group({
      _id: "$_id",
      room: { $first: "$$ROOT" },
      count: { $sum: 1 },
    });
