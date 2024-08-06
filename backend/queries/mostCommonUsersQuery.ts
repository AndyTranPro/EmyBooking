import { User } from "../models/User";

export const mostCommonUsersQuery = (start: string, end: string) =>
  User.aggregate()
    .lookup({
      from: "bookings",
      localField: "_id",
      foreignField: "user",
      as: "bookings",
    })
    .unwind("$bookings")
    .match({
      "bookings.start": { $lte: new Date(end) },
      "bookings.end": { $gte: new Date(start) },
    })
    .group({
      _id: "$_id",
      number_of_bookings: { $sum: 1 },
      doc: { $first: "$$ROOT" },
    });
