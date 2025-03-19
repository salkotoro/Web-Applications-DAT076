import { app } from "./start";
import cors from "cors";
import session from "express-session";
import express from "express";
import { userRouter } from "./routers/userRouter";
import { sequelize } from "../db/conn";
import { projectRouter } from "./routers/projectRouter";

const port = process.env.PORT || 3000;

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);

// Sync database models with the database
// WARNING: Using {force: true} will drop all tables - only use in development
sequelize.sync({ alter: true }).then(() => {
  console.log("Database schema synchronized");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
