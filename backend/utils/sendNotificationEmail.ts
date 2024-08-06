import moment from "moment";
import { Booking } from "../models/Booking";
import { sendEmail } from "./sendEmail";

// currently broken, maybe ask someone else to fix
export const sendNotificationEmail = async (to: string, bookingId: string) => {
  const from = "m.arsalah003@gmail.com";
  const booking = (await Booking.findById(bookingId))!;
  const subject = `Reminder for booking ${bookingId} which is in 15 minutes`;
  const text = JSON.stringify(booking);
  const start = booking.start;
  // @ts-ignore fix later
  const before = moment(start).subtract(15, "minutes").unix();
  console.log(before, start, "blah blah");

  await sendEmail({
    from,
    subject,
    text,
    to,
    sendAt: before,
  });
};
