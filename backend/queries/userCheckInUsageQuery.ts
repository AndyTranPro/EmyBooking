import moment from "moment";
import { Room } from "../models/Room";
import { User } from "../models/User";

export const userCheckInUsageQuery = (start: string, end: string) =>
  User.aggregate([
    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "user",
        as: "bookings",
      },
    },
    {
      $unwind: "$bookings",
    },
    {
      $match: {
        "bookings.start": { $lte: new Date(end) },
        "bookings.end": { $gte: new Date(start) },
      },
    },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$$ROOT" },
        checkedInCount: { $sum: { $cond: ["$bookings.isCheckedIn", 1, 0] } },
        totalCount: { $sum: 1 },
      },
    },
    {
      $project: {
        user: 1,
        checkedInPercentage: { $divide: ["$checkedInCount", "$totalCount"] },
      },
    },
  ]);
