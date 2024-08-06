import request from "supertest";
import app from "../app";
import roomsData from "../mock_data/rooms.json";

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

describe("Get room(s)", () => {
  it("should successfully get all rooms", async () => {
    const {
      body: { rooms },
    } = await user.get(`${API_ROOT}/rooms`).expect(StatusCodes.OK);

    // assumes that the rooms in db dont differ from the ones in rooms.json (i.e. no deletions, insertions
    // or modifications of names)
    expect(rooms).toHaveLength(roomsData.length);
  });
  it("should unsuccessfully get all rooms as not authorised", async () => {
    await request(app)
      .get(`${API_ROOT}/rooms`)
      .expect(StatusCodes.UNAUTHORIZED);
  });
  it("should successfully get a single room", async () => {
    const {
      body: { rooms },
    } = await user.get(`${API_ROOT}/rooms`).expect(StatusCodes.OK);
    const randomRoom = rooms[Math.round(Math.random() * (rooms.length - 1))];
    const {
      body: { room },
    } = await user
      .get(`${API_ROOT}/rooms/${randomRoom._id}`)
      .expect(StatusCodes.OK);
    // compare room gotten from allRooms and room gotten with getSingleRoom
    expect(room).toStrictEqual(randomRoom);
  });
  it("should unsuccessfully get a single room", async () => {
    // id is in correct format but room with such id doesent exist
    const wrongRoomId = "666666666666666666666666";
    await user
      .get(`${API_ROOT}/rooms/${wrongRoomId}`)
      .expect(StatusCodes.BAD_REQUEST);

    // id is in wrong format (api will give 404, see error-handler.ts as to why)
    const anotherWrongRoomId = "blah";
    await user
      .get(`${API_ROOT}/rooms/${anotherWrongRoomId}`)
      .expect(StatusCodes.NOT_FOUND);
  });
});
describe("Creating and deleting rooms", () => {
  it("successfully creates a room", async () => {
    const newRoomObj = {
      name: "new room",
      size: 16,
      type: "meeting room",
      level: 2,
    };
    const {
      body: { room },
    } = await user
      .post(`${API_ROOT}/rooms`)
      .send(newRoomObj)
      .expect(StatusCodes.CREATED);

    // assuming that rooms in db were same as in rooms.json

    const {
      body: { rooms: newRooms },
    } = await user.get(`${API_ROOT}/rooms`);

    expect(newRooms).toHaveLength(roomsData.length + 1);

    // cleanup (delete added room)

    await user.delete(`${API_ROOT}/rooms/${room._id}`).expect(StatusCodes.OK);
    // check we have same amount of rooms as before insertion
    const {
      body: { rooms },
    } = await user.get(`${API_ROOT}/rooms`);

    expect(rooms).toHaveLength(roomsData.length);
  });
  it("unsuccessfully creates a room", async () => {
    // invalid as level not given
    const newInvalidRoomObj = {
      name: "new room",
      size: 16,
      type: "meeting room",
    };
    await user
      .post(`${API_ROOT}/rooms`)
      .send(newInvalidRoomObj)
      .expect(StatusCodes.BAD_REQUEST);

    // check amount of rooms is the same
    const {
      body: { rooms: newRooms },
    } = await user.get(`${API_ROOT}/rooms`);

    expect(newRooms).toHaveLength(roomsData.length);
  });
});
describe("Updating a room", () => {
  it("successfully updates a room", async () => {
    // changes the room and size of a room

    const updateObj = { name: "updated-room", size: 400 };

    // get a random room
    const {
      body: { rooms },
    } = await user.get(`${API_ROOT}/rooms`).expect(StatusCodes.OK);
    const randomRoom = rooms[Math.round(Math.random() * (rooms.length - 1))];

    const {
      body: { updatedRoom },
    } = await user
      .patch(`${API_ROOT}/rooms/${randomRoom._id}`)
      .send(updateObj)
      .expect(StatusCodes.OK);

    // check fields have been updated
    expect(updatedRoom.name).toBe(updateObj.name);
    expect(updatedRoom.size).toBe(updateObj.size);

    // change room back to origin state
    const {
      body: { updatedRoom: updatedRoomAgain },
    } = await user
      .patch(`${API_ROOT}/rooms/${randomRoom._id}`)
      .send({ size: randomRoom.size, name: randomRoom.name })
      .expect(StatusCodes.OK);

    // check that room is in its origin state
    expect(updatedRoomAgain).toStrictEqual(randomRoom);
  });

  it("unsuccessfully updates a room", async () => {
    const {
      body: { rooms },
    } = await user.get(`${API_ROOT}/rooms`).expect(StatusCodes.OK);
    const randomRoom = rooms[Math.round(Math.random() * (rooms.length - 1))];

    // give level as wrong type
    await user
      .patch(`${API_ROOT}/rooms/${randomRoom._id}`)
      .send({ level: "blah" })
      .expect(StatusCodes.NOT_FOUND);
  });
});
