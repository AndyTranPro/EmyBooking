declare namespace Express {
  export interface Request {
    user: {
      type: "cse_staff" | "non_cse_staff" | "hdr_student" | "admin";
      zid: string;
      email: string;
      name: string;
      userId: string;
      hasConfirmationEmail: boolean;
      hasNotificationEmail: boolean;
    };
  }
}
