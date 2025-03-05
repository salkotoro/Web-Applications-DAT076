import express, { Request, Response, RequestHandler } from "express";
import { userService } from "../services/userService";
import { userController } from "../controllers/userController";

declare module "express-session" {
  interface Session {
    userId?: number;
  }
}

export const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  try {
    const user = await userService.register(req.body);
    req.session.userId = user.id;
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userService.login(username, password);
    req.session.userId = user.id;
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    }
  }
});

userRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: "Logged out successfully" });
  });
});

userRouter.get("/me", (async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await userService.getUserById(req.session.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
}) as RequestHandler);

userRouter.get("/", userController.getAllUsers);
userRouter.get("/:id", userController.getUserById);
userRouter.patch("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);
