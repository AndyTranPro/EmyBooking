import moment from "moment";
import { Room } from "../models/Room";

export const roomsUsageQuery = (start: string, end: string) =>
  Room.aggregate([
    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "room",
        as: "bookings",
      },
    },
    {
      $unwind: {
        path: "$bookings",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "bookings.start": { $lte: new Date(end) },
        "bookings.end": {
          $gte: new Date(start),
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        room: { $first: "$$ROOT" },
        usage: {
          $sum: {
            $divide: [
              "$bookings.duration",
              // number of hours between start and end
              moment.duration(moment(end).diff(moment(start))).asHours(),
            ],
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$room", { usage: { $ifNull: ["$usage", 0] } }],
        },
      },
    },
    {
      $sort: { usage: -1 },
    },
  ]);
