import { connect } from "mongoose";

export const connectDB = (url: string) => connect(url);
