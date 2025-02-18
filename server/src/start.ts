import express from "express";
import { router } from "./router/projects";

export const app = express();

app.use(express.json());
app.use("/projects", router);
