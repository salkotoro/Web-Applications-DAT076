import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { projectController } from "../controllers/projectController";

export const projectRouter = express.Router();

projectRouter.get("/", authMiddleware, (req, res) => {
  res.status(200).json([]); // Return empty array for now
});
