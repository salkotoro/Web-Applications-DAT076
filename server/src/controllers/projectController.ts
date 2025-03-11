import { Request, Response } from "express";

export const projectController = {
  getAllProjects: async (req: Request, res: Response) => {
    // TODO: Implement project retrieval
    res.status(200).json([]);
  },
};