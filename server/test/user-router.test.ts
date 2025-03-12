import request from "supertest";
import { app } from "../src/start";
import { UserType } from "../src/models/User";
import { User } from "../db/user.db";
import { sequelize } from "../db/conn";

describe("User API Routes", () => {
  // Store IDs of created users for cleanup
  let createdUserIds: number[] = [];
  
  // Base test user template
  const testUser = {
    username: "testuser",
    password: "password123",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    userType: UserType.EMPLOYEE,
  };

  // Set up database before all tests
  beforeAll(async () => {
    // Force sync the database to start with clean tables
    await sequelize.sync({ force: true });
  });

  // Clean up after all tests
  afterAll(async () => {
    // Clean up any remaining test users
    try {
      for (const id of createdUserIds) {
        await User.destroy({ where: { id } });
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
    
    // Close database connection
    await sequelize.close();
  });

  // Clean up after each test
  afterEach(async () => {
    // Reset createdUserIds for the next test
    createdUserIds = [];
  });

  // Helper function to create a unique username for each test
  const getUniqueUsername = (base: string, suffix: string) => {
    return `${base}_${suffix}_${Date.now()}`;
  };

  test("Should create a new user", async () => {
    const uniqueUser = {
      ...testUser,
      username: getUniqueUsername(testUser.username, "create"),
      email: `create_${Date.now()}@example.com`,
    };

    const res = await request(app).post("/api/users/register").send(uniqueUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    
    // Add to cleanup list
    createdUserIds.push(res.body.id);
  });

  test("Should get all users", async () => {
    // Create a test user first
    const uniqueUser = {
      ...testUser,
      username: getUniqueUsername(testUser.username, "getall"),
      email: `getall_${Date.now()}@example.com`,
    };
    
    const createRes = await request(app).post("/api/users/register").send(uniqueUser);
    createdUserIds.push(createRes.body.id);
    
    // Now get all users
    const res = await request(app).get("/api/users");
    
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some((user: any) => user.username === uniqueUser.username)).toBe(true);
  });

  test("Should get user by ID", async () => {
    // Create a test user first
    const uniqueUser = {
      ...testUser,
      username: getUniqueUsername(testUser.username, "getbyid"),
      email: `getbyid_${Date.now()}@example.com`,
    };
    
    const createRes = await request(app).post("/api/users/register").send(uniqueUser);
    const createdId = createRes.body.id;
    createdUserIds.push(createdId);
    
    // Get the user by ID
    const res = await request(app).get(`/api/users/${createdId}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdId);
    expect(res.body.username).toBe(uniqueUser.username);
  });

  test("Should return 404 for non-existent user", async () => {
    // Use a very large ID that shouldn't exist
    const nonExistentId = 99999;
    const res = await request(app).get(`/api/users/${nonExistentId}`);
    
    expect(res.statusCode).toBe(404);
  });

  test("Should update a user", async () => {
    // Create a test user first
    const uniqueUser = {
      ...testUser,
      username: getUniqueUsername(testUser.username, "update"),
      email: `update_${Date.now()}@example.com`,
    };
    
    const createRes = await request(app).post("/api/users/register").send(uniqueUser);
    const createdId = createRes.body.id;
    createdUserIds.push(createdId);
    
    // Update the user
    const updatedUsername = `${uniqueUser.username}_updated`;
    const res = await request(app).patch(`/api/users/${createdId}`).send({
      username: updatedUsername,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe(updatedUsername);
    
    // Verify the update in the database
    const updatedUser = await User.findByPk(createdId);
    expect(updatedUser?.username).toBe(updatedUsername);
  });

  test("Should return 400 for invalid user update", async () => {
    // Create a test user first
    const uniqueUser = {
      ...testUser,
      username: getUniqueUsername(testUser.username, "invalid"),
      email: `invalid_${Date.now()}@example.com`,
    };
    
    const createRes = await request(app).post("/api/users/register").send(uniqueUser);
    const createdId = createRes.body.id;
    createdUserIds.push(createdId);
    
    // Try to update with an invalid email
    const res = await request(app).patch(`/api/users/${createdId}`).send({
      email: "invalidemail", // Invalid email format
    });

    expect(res.statusCode).toBe(400);
  });

  test("Should delete a user", async () => {
    // Create a test user first
    const uniqueUser = {
      ...testUser,
      username: getUniqueUsername(testUser.username, "delete"),
      email: `delete_${Date.now()}@example.com`,
    };
    
    const createRes = await request(app).post("/api/users/register").send(uniqueUser);
    const createdId = createRes.body.id;
    
    // Delete should succeed
    const res = await request(app).delete(`/api/users/${createdId}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain(`User ${createdId} deleted successfully`);
    
    // Verify the user was deleted
    const deletedUser = await User.findByPk(createdId);
    expect(deletedUser).toBeNull();
    
    // No need to add to createdUserIds since we just deleted it
  });

  test("Should return 404 when deleting non-existent user", async () => {
    // Use a very large ID that shouldn't exist
    const nonExistentId = 99999;
    const res = await request(app).delete(`/api/users/${nonExistentId}`);
    
    expect(res.statusCode).toBe(404);
  });
});
