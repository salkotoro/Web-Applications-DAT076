import cors from "cors";
import express from "express";
import { router } from "./router/projects";
import { userRouter } from "./router/user";

export const app = express();

app.use(express.json());
app.use(cors());

app.use("/projects", router);
app.use("/user", userRouter);
