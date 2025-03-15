import { testSession } from "./setup";
import bcrypt from "bcrypt";

describe("Authentication", () => {
  const testUser = {
    username: "testuser",
    password: "testpass123",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
  };

  test("should register a new user", async () => {
    const response = await testSession
      .post("/api/users/register")
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.username).toBe(testUser.username);
    expect(response.body.password).toBeUndefined(); // Password should be hashed
  });

  test("should not register user with existing username", async () => {
    const response = await testSession
      .post("/api/users/register")
      .send(testUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("already exists");
  });

  test("should login with correct credentials", async () => {
    const response = await testSession.post("/api/users/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(testUser.username);
    expect(response.body.password).toBeUndefined();
  });

  test("should reject login with incorrect password", async () => {
    const response = await testSession.post("/api/users/login").send({
      username: testUser.username,
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Invalid");
  });

  test("should logout successfully", async () => {
    // First login
    await testSession.post("/api/users/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    // Then logout
    const response = await testSession.post("/api/users/logout");
    expect(response.status).toBe(200);
  });

  test("should require authentication for protected routes", async () => {
    const response = await testSession.get("/api/projects");
    expect(response.status).toBe(401);
  });
});