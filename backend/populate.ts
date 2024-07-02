import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

import { connectDB } from "./db/connect";
import { User } from "./models/User";
import staff from "./mock_data/staff.json";
import students from "./mock_data/HDR_students.json";
import rooms from "./mock_data/rooms.json";
import { Room } from "./models/Room";

const { MONGO_URI, JWT_SECRET } = process.env;

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
    await User.deleteMany();
    await Room.deleteMany();

    await User.create([...augmentedStaff, ...augmentedStudents]);
    await Room.create(rooms);
    console.log("Success!!!!");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
