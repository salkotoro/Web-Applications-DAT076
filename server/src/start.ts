import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { userRouter } from "./routers/userRouter";
import { projectRouter } from "./routers/projectRouter";

dotenv.config();

if (!process.env.SESSION_SECRET) {
  console.log("Could not find SESSION_SECRET in .env file");
  process.exit();
}

const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Routes
app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);

// Export the app
export { app };