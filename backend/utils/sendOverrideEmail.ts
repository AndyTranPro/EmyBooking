import { Booking } from "../models/Booking";
import { User } from "../models/User";
import { sendEmail } from "./sendEmail";

export const sendOverrideEmail = async (to: string, bookingId: string) => {
  const from = "m.arsalah003@gmail.com";

  const booking = await Booking.findById(bookingId);
  const subject = `Booking with booking id ${bookingId} has been overrided by an admin`;
  const text = JSON.stringify(booking);

  await sendEmail({
    from,
    subject,
    text,
    to,
  });
};
