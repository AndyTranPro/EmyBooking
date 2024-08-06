import { Room } from "../models/Room";

export const availableBetweenQuery = (start: string, end: string) =>
  Room.aggregate()
    .lookup({
      from: "bookings",
      localField: "_id",
      foreignField: "room",
      as: "bookings",
    })
    .match({
      bookings: {
        $not: {
          $elemMatch: {
            start: { $lt: new Date(end) },
            end: { $gt: new Date(start) },
          },
        },
      },
    })
    .project({
      bookings: 0,
    });
