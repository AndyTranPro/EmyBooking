import { Booking } from "../models/Booking";
import { User } from "../models/User";
import { sendEmail } from "./sendEmail";

export const notifyAdminEmail = async (bookingId: string) => {
  const from = "m.arsalah003@gmail.com";
  // find admin email address
  const admin = (await User.findOne({ email: "m.arsalah003@gmail.com" }))!;
  const to = admin?.email;
  const booking = await Booking.findById(bookingId);
  const subject = `Booking with booking id ${bookingId} has been created outside of working hours`;
  const text = JSON.stringify(booking);

  await sendEmail({
    from,
    subject,
    text,
    to,
  });
};
