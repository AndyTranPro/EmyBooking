import request from "supertest";
import app from "../app";

import { config } from "dotenv";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
config();
const { MONGO_URI, API_ROOT } = process.env;

// Notes: registering a user and logging in with a password
// isent tested as it is already tested on the frontend user flow tests

// user agents
const user = request.agent(app);

// connect to db
beforeAll(() => mongoose.connect(MONGO_URI as string));

/* Closing database connection after each test. */
afterAll(() => mongoose.connection.close());

describe("logging in", () => {
  it("should successfully login", async () => {
    const credentials = { email: "m.arsalah003@gmail.com" };
    const res = await user.post(`${API_ROOT}/auth/login`).send(credentials);
    expect(res.statusCode).toBe(StatusCodes.OK);
  });

  it("should unsuccessfully login as invalid email", async () => {
    const credentials = { email: "blah@gmail.com" };
    const res = await user.post(`${API_ROOT}/auth/login`).send(credentials);
    expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
  });
  it("should unsuccessfully login as email isent given ", async () => {
    const credentials = {};
    const res = await user.post(`${API_ROOT}/auth/login`).send(credentials);
    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });
});

describe("logging out", () => {
  it("should login and successfully logout", async () => {
    const credentials = { email: "m.arsalah003@gmail.com" };

    // login and extract cookie from response to use in logout request
    const authRes = await user
      .post(`${API_ROOT}/auth/login`)
      .send(credentials)
      .expect(StatusCodes.OK);

    const [cookie] = authRes.get("Set-Cookie")!;

    await user
      .get(`${API_ROOT}/auth/logout`)
      .set("Cookie", cookie)
      .expect(StatusCodes.OK);
  });

  it("should unsuccessfully logout when not logged in", async () => {
    // no cookie given
    await user.get(`${API_ROOT}/auth/logout`).expect(StatusCodes.UNAUTHORIZED);
  });
});
