import express, { Request, Response } from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import "express-async-errors";
import { connectDB } from "./db/connect";
import { errorHandlerMiddleware } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";

// Swagger
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
const swaggerDocument = YAML.load("./swagger.yaml");

// routers
import { authRouter } from "./routes/authRoutes";
import { userRouter } from "./routes/userRoutes";
import { roomRouter } from "./routes/roomRouter";
import { bookingRouter } from "./routes/bookingRoutes";
import { reviewRouter } from "./routes/reviewRoutes";

import { authenticateUser } from "./middleware/full-auth";
import morgan from "morgan";
import { orderRouter } from "./routes/orderRoutes";

// allows access to env variables from .env file via process.env
config();

const app = express();

//env variables
const { MONGO_URI, PORT, JWT_SECRET } = process.env;

//security packages middlware
const corsOptions = {
  origin: "http://localhost:5000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
// morgan logs a formatted http request line
app.use(morgan("tiny"));
// lets us be able to serve our default images
app.use(express.static("public"));
// put request date into body
app.use(express.json());
// parses cookies into req.signedCookies for incoming requests
app.use(cookieParser(JWT_SECRET));

// setting up swagger documentation
app.get("/", (req: Request, res: Response) =>
  res.send(
    '<h1> Comp3900 project API </h1> <a href="/api-docs"> Documentation </a>'
  )
);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/bookings", authenticateUser, bookingRouter);
app.use("/api/v1/users", authenticateUser, userRouter);

// app.use("/api/v1/orders", authenticateUser, orderRouter);
// app.use("/api/v1/reviews", reviewRouter);

app.use(notFound);
// error handler must be last middlware by express rules
app.use(errorHandlerMiddleware);

const port = PORT || 3000;

// start up server and MongoDB connection
(async () => {
  try {
    await connectDB(MONGO_URI as string);
    console.log(`db is up and running...`);
    app.listen(port, () =>
      console.log(`Server is up and running on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
})();
