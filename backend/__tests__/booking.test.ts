import request from "supertest";
import app from "../app";
import staff from "../mock_data/staff.json";
import roomsData from "../mock_data/rooms.json";

import students from "../mock_data/HDR_students.json";
import { config } from "dotenv";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { urlencoded } from "express";
import { Booking } from "../models/Booking";
import { mongooseRoomI } from "../types";
config();
const { MONGO_URI, API_ROOT } = process.env;

// user agents, reminder that cookies persist between requests for a single agent
const CSE_staff = request.agent(app);
const CSE_admin = request.agent(app);
const HDR_student = request.agent(app);
const non_CSE_staff = request.agent(app);

// stores random room id for when trying to make a booking
let randomRoomId1: string;
let randomRoomId2: string;
let CSE_staff_id: string;
let non_CSE_staff_id: string;

let HDR_student_id: string;

const invalidId = "666666666666666666666666";

// connect to db and login agents
beforeAll(async () => {
  await mongoose.connect(MONGO_URI as string);
  // login user agent so that further requests will have cookie set
  // get the ids of the user agents

  CSE_staff_id = (
    await CSE_staff.post(`${API_ROOT}/auth/login`).send({
      email: "aooif@unsw.edu.au",
    })
  ).body.user.userId;

  await CSE_admin.post(`${API_ROOT}/auth/login`).send({
    email: "m.arsalah003@gmail.com",
  });
  HDR_student_id = (
    await HDR_student.post(`${API_ROOT}/auth/login`).send({
      email: "z34966@ad.student.unsw.edu.au",
    })
  ).body.user.userId;
  non_CSE_staff_id = (
    await non_CSE_staff.post(`${API_ROOT}/auth/login`).send({
      email: "ddbgfyb@unsw.edu.au",
    })
  ).body.user.userId;
  const {
    body: { rooms },
  } = await CSE_staff.get(`${API_ROOT}/rooms`).expect(StatusCodes.OK);

  randomRoomId1 = rooms[1]._id;
  randomRoomId2 = rooms[2]._id;
});

/* Closing database connection after each test. */
afterAll(() => mongoose.connection.close());

describe("Get bookings(s)", () => {
  beforeAll(async () => {
    // create some dummy bookings
    const {
      body: { rooms },
    } = await CSE_staff.get(`${API_ROOT}/rooms`).expect(StatusCodes.OK);
    // make a booking for 5 rooms at same time (CSE staff is allowed to do this, whereas other users arent)
    await Promise.all(
      rooms.slice(0, 5).map(({ _id }: { _id: string }) =>
        CSE_staff.post(`${API_ROOT}/bookings`).send({
          room: _id,
          start: "2024-07-13T00:00:00.373Z",
          duration: 4,
          description: "dummy booking",
        })
      )
    );
  });
  afterAll(async () => {
    // delete all bookings made in the beforeAll
    await Booking.deleteMany();
  });
  it("should successfully get all bookings", async () => {
    const {
      body: { bookings },
    } = await CSE_staff.get(`${API_ROOT}/bookings`).expect(StatusCodes.OK);

    // assumes bookings made for 5 rooms as stipulated in the beforeAll funciton
    expect(bookings).toHaveLength(5);
  });
  it("should unsuccessfully get all bookings as not authorized", async () => {
    await request(app)
      .get(`${API_ROOT}/bookings`)
      .expect(StatusCodes.UNAUTHORIZED);
  });
  it("should successfully get a single booking", async () => {
    // gets all bookings
    const {
      body: { bookings },
    } = await CSE_staff.get(`${API_ROOT}/bookings`).expect(StatusCodes.OK);

    // gets a single random booking from all bookings
    const randomBooking =
      bookings[Math.round(Math.random() * (bookings.length - 1))];

    // gets the same booking through getSingleBooking route and checks that they are the same
    const {
      body: { booking: foundBooking },
    } = await CSE_staff.get(`${API_ROOT}/bookings/${randomBooking._id}`).expect(
      StatusCodes.OK
    );

    // compare user gotten from allUsers and user gotten with getSingleUser

    expect(foundBooking._id).toBe(randomBooking._id);
    expect(foundBooking.room).toBe(randomBooking.room._id);
    expect(foundBooking.start).toBe(randomBooking.start);
    expect(foundBooking.duration).toBe(randomBooking.duration);
  });
  it("should unsuccessfully get a single booking", async () => {
    // id is in correct format but room with such id doesent exist
    const wrongBookingId = "666666666666666666666666";
    await CSE_staff.get(`${API_ROOT}/bookings/${wrongBookingId}`).expect(
      StatusCodes.BAD_REQUEST
    );

    // id is in wrong format (api will give 404, see error-handler.ts as to why)
    const anotherWrongBookingId = "blah";
    await CSE_staff.get(`${API_ROOT}/bookings/${anotherWrongBookingId}`).expect(
      StatusCodes.NOT_FOUND
    );
  });
  it("should get the current users bookings", async () => {
    const {
      body: { bookings: CSE_staff_bookings },
    } = await CSE_staff.get(`${API_ROOT}/bookings/showAllMyBookings`).expect(
      StatusCodes.OK
    );
    // 5 bookings were made in the beforeAll
    expect(CSE_staff_bookings).toHaveLength(5);

    const {
      body: { bookings: HDR_student_bookings },
    } = await HDR_student.get(`${API_ROOT}/bookings/showAllMyBookings`).expect(
      StatusCodes.OK
    );
    // this hdr student never made any bookings
    expect(HDR_student_bookings).toHaveLength(0);

    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-14T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    // create the booking
    await HDR_student.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    const {
      body: { bookings: HDR_student_new_bookings },
    } = await HDR_student.get(`${API_ROOT}/bookings/showAllMyBookings`).expect(
      StatusCodes.OK
    );

    expect(HDR_student_new_bookings).toHaveLength(1);
  });
});
describe("create and delete bookings", () => {
  beforeEach(async () => {
    // delete all bookings
    await Booking.deleteMany();
  });
  it("should successfully create a booking by a CSE staff", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    // create the booking
    await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    // check that there is 1 booking in db
    const {
      body: { bookings },
    } = await CSE_staff.get(`${API_ROOT}/bookings`).expect(StatusCodes.OK);

    expect(bookings).toHaveLength(1);
  });

  it("should successfully create a booking on behalf of another user by an admin ", async () => {
    // get id of a cse_staff

    const bookingObj = {
      room: randomRoomId1,
      user: CSE_staff_id,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };
    console.log(CSE_staff_id);
    const {
      body: {
        booking: { user },
      },
    } = await CSE_admin.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    expect(user).toBe(CSE_staff_id);
  });
  it("should successfully book within the timeframe as another booking with cse staff", async () => {
    // reminder: cse staff are privileged with being able to have bookings within the same timeframe with different rooms
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "okay booking",
    };

    await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    // booking in same timeframe
    const clashingBookingObj = {
      room: randomRoomId2,
      start: "2024-07-13T03:00:00.373Z",
      duration: 2,
      description: "this is a valid booking for a cse staff",
    };

    await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(clashingBookingObj)
      .expect(StatusCodes.CREATED);

    const {
      body: { bookings: finalBookings },
    } = await CSE_staff.get(`${API_ROOT}/bookings`).expect(StatusCodes.OK);

    expect(finalBookings).toHaveLength(2);
  });
  it("should unsuccessfully create a booking on behalf of another user by a non admin", async () => {
    const bookingObj = {
      room: randomRoomId1,
      user: HDR_student_id,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.UNAUTHORIZED);
  });
  it("should unsuccessfully create a booking on behalf of a non hdr student", async () => {
    const bookingObj = {
      room: randomRoomId1,
      user: HDR_student_id,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    await CSE_admin.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.BAD_REQUEST);
  });
  it("should unsuccessfully create a booking on behalf of a invalid user id", async () => {
    const bookingObj = {
      room: randomRoomId1,
      user: invalidId,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    await CSE_admin.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.BAD_REQUEST);
  });
  it("should unsuccessfully create a booking by giving an invalid room id", async () => {
    const bookingObj = {
      room: invalidId,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.BAD_REQUEST);
  });
  it("should unsuccessfully create a booking by trying to make a booking for same room at the same time as another booking ", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "okay booking",
    };

    await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    const clashingBookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T03:00:00.373Z",
      duration: 2,
      description: "this is a clashing booking",
    };

    await CSE_admin.post(`${API_ROOT}/bookings`)
      .send(clashingBookingObj)
      .expect(StatusCodes.BAD_REQUEST);
  });
  it("should unsuccessfully create a booking by trying to make a booking in the same timeframe as another for a hdr student", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "okay booking",
    };

    await HDR_student.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    // invalid booking in same timeframe
    const clashingBookingObj = {
      room: randomRoomId2,
      start: "2024-07-13T03:00:00.373Z",
      duration: 2,
      description: "this is a clashing booking",
    };

    await HDR_student.post(`${API_ROOT}/bookings`)
      .send(clashingBookingObj)
      .expect(StatusCodes.BAD_REQUEST);

    // valid booking not in same timeframe
    const validBookingObj = {
      room: randomRoomId2,
      start: "2024-07-13T04:00:00.373Z",
      duration: 2,
      description: "this is a clashing booking",
    };

    await HDR_student.post(`${API_ROOT}/bookings`)
      .send(validBookingObj)
      .expect(StatusCodes.CREATED);
  });
  it("should successfully delete ones own booking", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    const {
      body: { bookings: initalBookings },
    } = await CSE_staff.get(`${API_ROOT}/bookings`).expect(StatusCodes.OK);

    expect(initalBookings).toHaveLength(1);

    await CSE_staff.delete(`${API_ROOT}/bookings/${booking._id}`)
      .send(bookingObj)
      .expect(StatusCodes.OK);

    const {
      body: { bookings: finalBookings },
    } = await CSE_staff.get(`${API_ROOT}/bookings`).expect(StatusCodes.OK);

    expect(finalBookings).toHaveLength(0);
  });
  it("should successfully delete a booking a cse staff booking by an admin", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    const {
      body: { bookings: initalBookings },
    } = await CSE_staff.get(`${API_ROOT}/bookings`).expect(StatusCodes.OK);

    expect(initalBookings).toHaveLength(1);

    await CSE_admin.delete(`${API_ROOT}/bookings/${booking._id}`)
      .send(bookingObj)
      .expect(StatusCodes.OK);

    const {
      body: { bookings: finalBookings },
    } = await CSE_staff.get(`${API_ROOT}/bookings`).expect(StatusCodes.OK);

    expect(finalBookings).toHaveLength(0);
  });
  it("should unsuccessfully delete a booking as a non admin is trying to delete someones elses booking", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    const {
      body: { bookings: initalBookings },
    } = await CSE_staff.get(`${API_ROOT}/bookings`).expect(StatusCodes.OK);

    expect(initalBookings).toHaveLength(1);

    await HDR_student.delete(`${API_ROOT}/bookings/${booking._id}`)
      .send(bookingObj)
      .expect(StatusCodes.FORBIDDEN);
  });
});
describe("Check in to bookings", () => {
  beforeEach(async () => {
    // clear bookings
    await Booking.deleteMany();
  });
  it("should successfully check into a booking", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    expect(booking.isCheckedIn).toBe(false);
    const {
      body: { updatedBooking },
    } = await CSE_staff.patch(`${API_ROOT}/bookings/${booking._id}/checkIn`)
      .send(bookingObj)
      .expect(StatusCodes.OK);

    expect(updatedBooking.isCheckedIn).toBe(true);
  });
  it("should unsuccessfully check into another users booking", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    expect(booking.isCheckedIn).toBe(false);
    await HDR_student.patch(`${API_ROOT}/bookings/${booking._id}/checkIn`)
      .send(bookingObj)
      .expect(StatusCodes.FORBIDDEN);

    // booking still not checked in
    const {
      body: { booking: notChangedBooking },
    } = await HDR_student.get(`${API_ROOT}/bookings/${booking._id}`)
      .send(bookingObj)
      .expect(StatusCodes.OK);

    expect(notChangedBooking.isCheckedIn).toBe(false);
  });
});
describe("Override booking", () => {
  beforeEach(async () => {
    // clear bookings
    await Booking.deleteMany();
  });
  it("should successfully override a booking", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    expect(booking.isOverrided).toBe(false);

    const {
      body: { updatedBooking },
    } = await CSE_admin.patch(
      `${API_ROOT}/bookings/${booking._id}/overrideBooking`
    )
      .send(bookingObj)
      .expect(StatusCodes.OK);

    expect(updatedBooking.isOverrided).toBe(true);

    // cant override an already overriden booking
    await CSE_admin.patch(
      `${API_ROOT}/bookings/${booking._id}/overrideBooking`
    ).expect(StatusCodes.BAD_REQUEST);
  });
  it("should unsuccessfully override a booking by a non admin", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    expect(booking.isOverrided).toBe(false);

    await HDR_student.patch(
      `${API_ROOT}/bookings/${booking._id}/overrideBooking`
    )
      .send(bookingObj)
      .expect(StatusCodes.FORBIDDEN);

    const {
      body: { booking: sameBooking },
    } = await CSE_staff.get(`${API_ROOT}/bookings/${booking._id}`)
      .send(bookingObj)
      .expect(StatusCodes.OK);
    expect(sameBooking.isOverrided).toBe(false);
  });
});
describe("Approving and denying booking requests", () => {
  beforeEach(async () => {
    // clear bookings
    await Booking.deleteMany();
  });
  it("should successfully approve a booking request", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await non_CSE_staff
      .post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    expect(booking.isRequest).toBe(true);
    expect(booking.isApproved).toBe(null);

    await CSE_admin.patch(
      `${API_ROOT}/bookings/${booking._id}/approveRequest`
    ).expect(StatusCodes.OK);

    const {
      body: { booking: updatedBooking },
    } = await CSE_admin.get(`${API_ROOT}/bookings/${booking._id}`).expect(
      StatusCodes.OK
    );

    expect(updatedBooking.isApproved).toBe(true);
  });
  it("should successfully deny a booking request", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await non_CSE_staff
      .post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    expect(booking.isRequest).toBe(true);
    expect(booking.isApproved).toBe(null);

    await CSE_admin.patch(
      `${API_ROOT}/bookings/${booking._id}/denyRequest`
    ).expect(StatusCodes.OK);

    const {
      body: { booking: updatedBooking },
    } = await CSE_admin.get(`${API_ROOT}/bookings/${booking._id}`).expect(
      StatusCodes.OK
    );

    expect(updatedBooking.isApproved).toBe(false);
  });
  it("should unsuccessfully approve/deny a non request booking", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await CSE_staff.post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    expect(booking.isRequest).toBe(false);

    await CSE_admin.patch(
      `${API_ROOT}/bookings/${booking._id}/denyRequest`
    ).expect(StatusCodes.BAD_REQUEST);

    await CSE_admin.patch(
      `${API_ROOT}/bookings/${booking._id}/approveRequest`
    ).expect(StatusCodes.BAD_REQUEST);

    const {
      body: { booking: sameBooking },
    } = await CSE_admin.get(`${API_ROOT}/bookings/${booking._id}`).expect(
      StatusCodes.OK
    );

    expect(sameBooking.isApproved).toBe(null);
    expect(sameBooking.isRequest).toBe(false);
  });
  it("should unsuccessfully approve/deny a request that is already approved or denied", async () => {
    const bookingObj = {
      room: randomRoomId1,
      start: "2024-07-13T00:00:00.373Z",
      duration: 4,
      description: "dummy booking",
    };

    const {
      body: { booking },
    } = await non_CSE_staff
      .post(`${API_ROOT}/bookings`)
      .send(bookingObj)
      .expect(StatusCodes.CREATED);

    expect(booking.isRequest).toBe(true);

    await CSE_admin.patch(
      `${API_ROOT}/bookings/${booking._id}/denyRequest`
    ).expect(StatusCodes.OK);

    await CSE_admin.patch(
      `${API_ROOT}/bookings/${booking._id}/approveRequest`
    ).expect(StatusCodes.BAD_REQUEST);

    await CSE_admin.patch(
      `${API_ROOT}/bookings/${booking._id}/denyRequest`
    ).expect(StatusCodes.BAD_REQUEST);

    const {
      body: { booking: sameBooking },
    } = await CSE_admin.get(`${API_ROOT}/bookings/${booking._id}`).expect(
      StatusCodes.OK
    );

    expect(sameBooking.isApproved).toBe(false);
    expect(sameBooking.isRequest).toBe(true);
  });
});
