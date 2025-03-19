import { userService } from "../src/services/userService";
import { sequelize } from "../db/conn";
import { User } from "../db/user.db";
import { UserType } from "../src/models/User";

describe("UserService Integration Tests", () => {
  const testUser = {
    username: "integrationtest",
    password: "testpass123",
    firstName: "Integration",
    lastName: "Test",
    email: "integration@test.com",
    userType: UserType.EMPLOYEE
  };

  // Set up and clean database before all tests
  beforeAll(async () => {
    // Make sure the database is properly synced
    await sequelize.sync({ force: true });
  });

  // Clean up the database after all tests
  afterAll(async () => {
    // Clean up data and close connection
    await User.destroy({ where: {}, force: true });
    await sequelize.close();
  });

  test("should connect to database and register a new user", async () => {
    // Register a new user
    const result = await userService.register(testUser);

    // Verify user was created with correct properties
    expect(result).toHaveProperty("id");
    expect(result.username).toBe(testUser.username);
    expect(result.firstName).toBe(testUser.firstName);
    expect(result.lastName).toBe(testUser.lastName);
    expect(result.email).toBe(testUser.email);
    expect(result).not.toHaveProperty("password");

    // Verify we can retrieve the user from the database
    const retrievedUser = await User.findOne({ where: { username: testUser.username } });
    expect(retrievedUser).not.toBeNull();
    expect(retrievedUser?.username).toBe(testUser.username);
  });

  test("should login with correct credentials", async () => {
    const result = await userService.login(testUser.username, testUser.password);

    expect(result).toHaveProperty("id");
    expect(result.username).toBe(testUser.username);
    expect(result).not.toHaveProperty("password");
  });

  test("should get all users including our test user", async () => {
    const users = await userService.getAllUsers();
    
    expect(users.length).toBeGreaterThan(0);
    expect(users.some(u => u.username === testUser.username)).toBe(true);
  });

  test("should update user information", async () => {
    // Find user to get ID
    const user = await User.findOne({ where: { username: testUser.username } });
    if (!user) throw new Error("Test user not found");

    // Update the user
    const updates = { firstName: "Updated", lastName: "Name" };
    const result = await userService.updateUser(user.id, updates);

    // Verify update was successful
    expect(result.firstName).toBe(updates.firstName);
    expect(result.lastName).toBe(updates.lastName);

    // Verify database was updated
    const updatedUser = await User.findByPk(user.id);
    expect(updatedUser?.firstName).toBe(updates.firstName);
    expect(updatedUser?.lastName).toBe(updates.lastName);
  });

  test("should delete user", async () => {
    // Create a user to delete
    const deleteTestUser = await User.create({
      username: "todelete",
      password: "password123",
      firstName: "Delete",
      lastName: "Me",
      email: "delete@test.com",
      userType: UserType.EMPLOYEE
    });

    // Delete the user
    await userService.deleteUser(deleteTestUser.id);

    // Verify user was deleted
    const deletedUser = await User.findByPk(deleteTestUser.id);
    expect(deletedUser).toBeNull();
  });
}); 