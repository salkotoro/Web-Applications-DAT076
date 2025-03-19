import { testSession } from "./setup";
import bcrypt from "bcrypt";
import { UserType } from "../src/models/User";
import { User } from "../db/user.db";

describe("Authentication", () => {
  const testUser = {
    username: "testuser",
    password: "testpass123",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    userType: UserType.EMPLOYEE,
  };

  // Clean up before tests to ensure a clean state
  beforeEach(async () => {
    // Clear any existing users from previous tests
    await User.destroy({ where: { username: testUser.username } });
  });
  
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
    // First register the user
    await testSession.post("/api/users/register").send(testUser);
    
    // Then try to register the same user again
    const response = await testSession
      .post("/api/users/register")
      .send(testUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("already exists");
  });

  test("should login with correct credentials", async () => {
    // First register the user
    await testSession.post("/api/users/register").send(testUser);
    
    // Then try to login
    const response = await testSession.post("/api/users/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(testUser.username);
    expect(response.body.password).toBeUndefined();
  });

  test("should reject login with incorrect password", async () => {
    // First register the user
    await testSession.post("/api/users/register").send(testUser);
    
    // Then try to login with incorrect password
    const response = await testSession.post("/api/users/login").send({
      username: testUser.username,
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Password is incorrect");
  });

  test("should logout successfully", async () => {
    // First register the user
    await testSession.post("/api/users/register").send(testUser);
    
    // Then login
    await testSession.post("/api/users/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    // Then logout
    const response = await testSession.post("/api/users/logout");
    expect(response.status).toBe(200);
  });

  test("should require authentication for protected routes", async () => {
    // Ensure we're logged out
    await testSession.post("/api/users/logout");
    
    // Test a protected route
    const response = await testSession.get("/api/projects/employer");
    expect(response.status).toBe(401);
  });
});
