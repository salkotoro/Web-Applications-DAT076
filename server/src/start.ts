import express from "express";
import { projectRouter } from "./router/project-router";
import { userRouter } from "./router/user-router";

export const app = express();

app.use(express.json());
app.use("/projects", projectRouter);
app.use("/users", userRouter);
