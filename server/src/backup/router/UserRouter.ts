import express, { Request, Response } from "express";
import { UserService } from "../service/UserService";
import { User } from "../model/User";

const userService = new UserService();
export const userRouter = express.Router();

// Get all users
userRouter.get(
  "/",
  async (req: Request<{}, {}, {}>, res: Response<Array<User> | String>) => {
    try {
      const users = await userService.getUsers();
      res.status(200).send(users);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  }
);

// Create a new user
userRouter.post(
  "/",
  async (req: Request<{}, {}, User>, res: Response<User | String>) => {
    try {
      if (typeof req.body !== "object") {
        res
          .status(400)
          .send(
            `Bad POST call to ${
              req.originalUrl
            } --- body has type ${typeof req.body}`
          );
        return;
      }

      const { firstName, lastName, username, password, email } = req.body;

      if (!firstName || typeof firstName !== "string") {
        res.status(400).send("Invalid or missing 'firstName'.");
        return;
      }

      if (!lastName || typeof lastName !== "string") {
        res.status(400).send("Invalid or missing 'lastName'.");
        return;
      }

      if (!username || typeof username !== "string") {
        res.status(400).send("Invalid or missing 'username'.");
        return;
      }

      if (!password || typeof password !== "string" || password.length < 6) {
        res
          .status(400)
          .send(
            "Invalid or missing 'password' (must be at least 6 characters)."
          );
        return;
      }

      if (!email || !email.includes("@") || !email.includes(".")) {
        res.status(400).send("Invalid or missing 'email'.");
        return;
      }

      const user = await userService.addUser(req.body);
      res.status(201).send(user);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  }
);

// Update an existing user
userRouter.patch(
  "/:id",
  async (
    req: Request<{ id: string }, {}, Partial<User>>,
    res: Response<User | String>
  ) => {
    try {
      if (typeof req.body !== "object") {
        res
          .status(400)
          .send(
            `Bad PATCH call to ${
              req.originalUrl
            } --- body has type ${typeof req.body}`
          );
        return;
      }

      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).send("Invalid user ID.");
        return;
      }

      const { firstName, lastName, username, password, email } = req.body;

      if (firstName !== undefined && typeof firstName !== "string") {
        res.status(400).send("Invalid 'firstName'.");
        return;
      }

      if (lastName !== undefined && typeof lastName !== "string") {
        res.status(400).send("Invalid 'lastName'.");
        return;
      }

      if (username !== undefined && typeof username !== "string") {
        res.status(400).send("Invalid 'username'.");
        return;
      }

      if (
        password !== undefined &&
        (typeof password !== "string" || password.length < 6)
      ) {
        res
          .status(400)
          .send("Invalid 'password' (must be at least 6 characters).");
        return;
      }

      if (
        email !== undefined &&
        (!email.includes("@") || !email.includes("."))
      ) {
        res.status(400).send("Invalid 'email'.");
        return;
      }

      const user = await userService.updateUser(userId, req.body);
      if (!user) {
        res.status(404).send("User not found.");
        return;
      }

      res.status(200).send(user);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  }
);

// Delete a user
userRouter.delete(
  "/:id",
  async (
    req: Request<{ id: string }, {}, {}>,
    res: Response<{ message: string; deletedUser: User } | String>
  ) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).send("Invalid user ID.");
        return;
      }

      const user = await userService.deleteUser(userId);
      if (!user) {
        res.status(404).send("User not found.");
        return;
      }

      res.status(200).send({
        message: `User ${userId} deleted successfully.`,
        deletedUser: user,
      });
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  }
);

// Get a user by ID
userRouter.get(
  "/:id",
  async (
    req: Request<{ id: string }, {}, {}>,
    res: Response<User | String>
  ) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).send("Invalid user ID.");
        return;
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        res.status(404).send("User not found.");
        return;
      }

      res.status(200).send(user);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  }
);
