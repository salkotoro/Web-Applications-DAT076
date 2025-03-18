import { userService } from "../src/services/userService";
import bcrypt from "bcrypt";

jest.mock("bcrypt", () => ({
  genSalt: jest.fn().mockResolvedValue("salt"),
  hash: jest.fn().mockResolvedValue("hashedPassword"),
  compare: jest.fn().mockImplementation((password) => {
    if (password === "wrongpassword") return Promise.resolve(false);
    return Promise.resolve(true);
  }),
}));

describe("UserService", () => {
  const testUser = {
    username: "testuser",
    password: "testpass123",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
  };

  beforeEach(() => {
    // Clear the users array before each test
    userService["users"] = [];
    userService["nextId"] = 1;
  });

  test("should register a new user", async () => {
    const result = await userService.register(testUser);

    expect(result).toHaveProperty("id", 1);
    expect(result.username).toBe(testUser.username);
    expect(bcrypt.hash).toHaveBeenCalledWith(testUser.password, "salt");
  });

  test("should not register user with existing username", async () => {
    await userService.register(testUser);

    await expect(userService.register(testUser)).rejects.toThrow(
      "Username already exists"
    );
  });

  test("should login with correct credentials", async () => {
    await userService.register(testUser);
    const result = await userService.login(
      testUser.username,
      testUser.password
    );

    expect(result).toHaveProperty("id", 1);
    expect(result.username).toBe(testUser.username);
  });

  test("should reject login with incorrect credentials", async () => {
    await userService.register(testUser);

    await expect(
      userService.login(testUser.username, "wrongpassword")
    ).rejects.toThrow("Invalid username or password");
  });
});