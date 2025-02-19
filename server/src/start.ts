import express from "express";
import { userRouter } from "./router/UserRouter";

export const app = express();

app.use(express.json());
app.use("/users", userRouter);
