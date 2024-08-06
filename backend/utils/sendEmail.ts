import sgMail from "@sendgrid/mail";

interface emailBody {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
  sendAt?: number;
}
export const sendEmail = async (emailObj: emailBody) => {
  const { SENDGRID_API_KEY } = process.env;
  sgMail.setApiKey(SENDGRID_API_KEY as string);
  const ret = await sgMail.send(emailObj);
  console.log(ret);
};
