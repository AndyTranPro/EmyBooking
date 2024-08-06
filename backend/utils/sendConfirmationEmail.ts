import { Booking } from "../models/Booking";
import { sendEmail } from "./sendEmail";

export const sendConfirmationEmail = async (to: string, bookingId: string) => {
  const from = "m.arsalah003@gmail.com";
  const booking = await Booking.findById(bookingId);
  const subject = `Confirmation for booking ${bookingId}`;
  const text = JSON.stringify(booking);

  await sendEmail({
    from,
    subject,
    text,
    to,
  });
};
