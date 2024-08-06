import moment from "moment";
import { Booking } from "../models/Booking";
import { sendEmail } from "./sendEmail";
import { User } from "../models/User";

export const sendFeedbackEmail = async (feedback: string, email: string) => {
  // find admin email address
  const admin = (await User.findOne({ email: "m.arsalah003@gmail.com" }))!;
  const to = admin?.email;
  const from = "m.arsalah003@gmail.com";
  const subject = `Feedback from ${email}`;
  const text = feedback;

  await sendEmail({
    from,
    subject,
    text,
    to,
  });
};
