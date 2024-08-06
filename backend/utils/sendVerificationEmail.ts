import { sendEmail } from "./sendEmail";
export const sendVerificationEmail = async (
  to: string,
  name: string,
  verificationToken: string
) => {
  const from = "m.arsalah003@gmail.com";
  const origin = "http://localhost:5000";
  const url = `${origin}/user/verify?token=${verificationToken}&email=${to}`;

  const html = `<h4>Hello ${name}</h4> <a href='${url}'>Click on this link to Verify!</a>`;

  const subject = `Verify your email for the CSE booking system!`;
  const text = "verify your email";
  await sendEmail({
    from,
    subject,
    text,
    to,
    html,
  });
};
