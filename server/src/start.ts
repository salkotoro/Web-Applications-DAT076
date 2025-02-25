import express from "express";
import { projectRouter } from "./router/project-router";
import { userRouter } from "./router/user-router";
import cors from "cors";

export const app = express();

app.use(express.json());
app.use(cors());
app.use("/projects", projectRouter);
app.use("/users", userRouter);
