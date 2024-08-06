import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });
import { connectDB } from "./db/connect";
import { User } from "./models/User";
import staff from "./mock_data/staff.json";
import students from "./mock_data/HDR_students.json";
import rooms from "./mock_data/rooms.json";
import { Room } from "./models/Room";
import { Booking } from "./models/Booking";
import mongoose, { connection } from "mongoose";

const { MONGO_URI, JWT_SECRET } = process.env;

// filter rooms to have unique names
const augmentedRooms = [...new Map(rooms.map((r) => [r["name"], r])).values()];

const augmentedStudents = students.map(
  ({
    Candidate_Name: name,
    Candidate_zID: zid,
    School_Name: school,
    Faculty_Name: faculty,
    Email_ID: email,
    Other_roles_within_CSE: role,
  }) => ({ name, zid, school, faculty, email, role, type: "hdr_student" })
);
const augmentedStaff = staff.map(
  ({
    Email_ID: email,
    Faculty_Name: faculty,
    Role: role,
    School_Name: school,
    Staff_Name: name,
    Staff_z_ID: zid,
    Title: title,
  }) => {
    let type;

    if (school === "CSE" && role === "Professional") type = "admin";
    else if (school === "CSE") type = "cse_staff";
    else {
      type = "non_cse_staff";
    }

    return {
      email,
      faculty,
      role,
      school,
      name,
      zid,
      type,
      title,
    };
  }
);

const start = async () => {
  try {
    await connectDB(MONGO_URI as string);

    // delete all collections
    await mongoose.connection.dropCollection("bookings");
    await mongoose.connection.dropCollection("users");
    await mongoose.connection.dropCollection("rooms");

    // initialise users and rooms from their respective json files
    await User.create([...augmentedStaff, ...augmentedStudents]);
    await Room.create(augmentedRooms);
    console.log("Success!!!!");
    if (require.main === module) process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
export default start;
// only runs when file is directly executed, otherwise
// if its imported, it wont run
if (require.main === module) start();
