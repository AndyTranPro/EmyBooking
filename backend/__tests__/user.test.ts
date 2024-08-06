import request from "supertest";
import app from "../app";
import staff from "../mock_data/staff.json";
import students from "../mock_data/HDR_students.json";
import { config } from "dotenv";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { urlencoded } from "express";
config();
const { MONGO_URI, API_ROOT } = process.env;

// user agents, reminder that cookies persist between requests for a single agent
const user = request.agent(app);

// connect to db and login agents
beforeAll(async () => {
  await mongoose.connect(MONGO_URI as string);
  // login user agent so that further requests will have cookie set
  const credentials = { email: "m.arsalah003@gmail.com" };

  await user.post(`${API_ROOT}/auth/login`).send(credentials);
});

/* Closing database connection after each test. */
afterAll(() => mongoose.connection.close());

describe("Get user(s)", () => {
  it("should successfully get all users", async () => {
    const {
      body: { users },
    } = await user.get(`${API_ROOT}/users`).expect(StatusCodes.OK);

    // assumes that the users in db dont differ from the ones in staff.json and HDR_students.json
    //  (i.e. no deletions, insertions or modifications of names)
    expect(users).toHaveLength(staff.length + students.length);
  });
  it("should unsuccessfully get all users as not authorized", async () => {
    await request(app)
      .get(`${API_ROOT}/rooms`)
      .expect(StatusCodes.UNAUTHORIZED);
  });
  it("should successfully get a single user", async () => {
    const {
      body: { users },
    } = await user.get(`${API_ROOT}/users`).expect(StatusCodes.OK);

    const randomUser = users[Math.round(Math.random() * (users.length - 1))];

    const {
      body: { user: foundUser },
    } = await user
      .get(`${API_ROOT}/users/${randomUser._id}`)
      .expect(StatusCodes.OK);

    // compare user gotten from allUsers and user gotten with getSingleUser

    expect(foundUser).toStrictEqual(randomUser);
  });
  it("should unsuccessfully get a single user", async () => {
    // id is in correct format but room with such id doesent exist
    const wrongUserId = "666666666666666666666666";
    await user
      .get(`${API_ROOT}/users/${wrongUserId}`)
      .expect(StatusCodes.BAD_REQUEST);

    // id is in wrong format (api will give 404, see error-handler.ts as to why)
    const anotherWrongUserId = "blah";
    await user
      .get(`${API_ROOT}/users/${anotherWrongUserId}`)
      .expect(StatusCodes.NOT_FOUND);
  });
});
describe("Updating a user", () => {
  it("successfully updates a user", async () => {
    // changes the name and faculty of a user

    const updateObj = { name: "updated-user", faculty: "blah" };

    // get user id of current user
    const {
      body: {
        user: { userId },
      },
    } = await user.get(`${API_ROOT}/users/showMe`).expect(StatusCodes.OK);

    // get user object of current user

    const {
      body: { user: originalUserState },
    } = await user.get(`${API_ROOT}/users/${userId}`).expect(StatusCodes.OK);

    // update current user with different faculty and name
    const {
      body: { updatedUser },
    } = await user
      .patch(`${API_ROOT}/users/updateUser`)
      .send(updateObj)
      .expect(StatusCodes.OK);

    // check fields have been updated
    expect(updatedUser.name).toBe(updateObj.name);
    expect(updatedUser.faculty).toBe(updateObj.faculty);

    // change user back to origin state
    const {
      body: { updatedUser: updatedUserAgain },
    } = await user
      .patch(`${API_ROOT}/users/updateUser`)
      .send({
        faculty: originalUserState.faculty,
        name: originalUserState.name,
      })
      .expect(StatusCodes.OK);

    // check that room is in its origin state
    expect(updatedUserAgain).toStrictEqual(originalUserState);
  });

  it("unsuccessfully updates a user", async () => {
    // give invalid type attribute
    const res = await user
      .patch(`${API_ROOT}/users/updateUser`)
      .send({ type: "blah" })
      .expect(StatusCodes.BAD_REQUEST);
  });
});
