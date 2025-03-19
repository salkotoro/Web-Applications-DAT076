import { Request, Response } from "express";
import { userService } from "../services/userService";

export const userController = {
  getAllUsers: async (req: Request, res: Response): Promise<void> => {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  },

  getUserById: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await userService.getUserById(Number(req.params.id));
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  },

  updateUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await userService.updateUser(
        Number(req.params.id),
        req.body
      );
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  },

  deleteUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await userService.deleteUser(id);
      res.status(200).json({ message: `User ${id} deleted successfully` });
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  },
};
