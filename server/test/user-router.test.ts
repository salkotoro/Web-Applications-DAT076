import request from "supertest";
import { app } from "../src/start";
import * as express from "express";

describe("User API Routes", () => {
  let userId: number;

  test("Should create a new user", async () => {
    const res = await request(app).post("/api/users/register").send({
      username: "john",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    userId = res.body.id;
  });

  test("Should get all users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Should get user by ID", async () => {
    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(userId);
  });

  test("Should return 404 for non-existent user", async () => {
    const res = await request(app).get("/api/users/999");
    expect(res.statusCode).toBe(404);
  });

  test("Should update a user", async () => {
    const res = await request(app).patch(`/api/users/${userId}`).send({
      username: "john_updated",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("john_updated");
  });

  test("Should return 400 for invalid user update", async () => {
    const res = await request(app).patch(`/api/users/${userId}`).send({
      email: "invalidemail",
    });

    expect(res.statusCode).toBe(400);
  });

  test("Should delete a user", async () => {
    const res = await request(app).delete(`/api/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain(`User ${userId} deleted successfully`);
  });

  test("Should return 404 when deleting non-existent user", async () => {
    const res = await request(app).delete("/api/users/999");
    expect(res.statusCode).toBe(404);
  });
});
