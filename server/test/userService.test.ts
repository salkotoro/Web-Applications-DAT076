import { userService } from "../src/services/userService";
import bcrypt from "bcrypt";
import { User } from "../db/user.db";
import { UserType } from "../src/models/User";

// Mock the Sequelize User model
jest.mock("../db/user.db", () => {
  const mockUser = {
    id: 1,
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "hashedPassword",
    userType: "employee",
    update: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
  };

  return {
    User: {
      findOne: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn().mockImplementation((userData) => Promise.resolve({
        id: 1,
        ...userData,
      })),
    },
  };
});

// Mock bcrypt
jest.mock("bcrypt", () => ({
  genSalt: jest.fn().mockResolvedValue("salt"),
  hash: jest.fn().mockResolvedValue("hashedPassword"),
  compare: jest.fn().mockImplementation((password) => {
    if (password === "wrongpassword") return Promise.resolve(false);
    return Promise.resolve(true);
  }),
}));

describe("UserService with Database", () => {
  const testUser = {
    username: "testuser",
    password: "testpass123",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    userType: UserType.EMPLOYEE
  };

  const mockDbUser = {
    id: 1,
    username: "testuser",
    password: "hashedPassword",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    update: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementations
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.findAll as jest.Mock).mockResolvedValue([mockDbUser]);
    (User.findByPk as jest.Mock).mockResolvedValue(mockDbUser);
  });

  test("should register a new user", async () => {
    const result = await userService.register(testUser);

    expect(User.findOne).toHaveBeenCalledWith({ where: { username: testUser.username } });
    expect(bcrypt.genSalt).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith(testUser.password, "salt");
    expect(User.create).toHaveBeenCalledWith({
      ...testUser,
      password: "hashedPassword",
    });

    expect(result).toHaveProperty("id", 1);
    expect(result.username).toBe(testUser.username);
    expect(result).not.toHaveProperty("password");
  });

  test("should not register user with existing username", async () => {
    // Mock existing user
    (User.findOne as jest.Mock).mockResolvedValueOnce(mockDbUser);

    await expect(userService.register(testUser)).rejects.toThrow(
      "Username already exists"
    );
    expect(User.findOne).toHaveBeenCalledWith({ where: { username: testUser.username } });
    expect(User.create).not.toHaveBeenCalled();
  });

  test("should login with correct credentials", async () => {
    // Mock existing user for login
    (User.findOne as jest.Mock).mockResolvedValueOnce(mockDbUser);

    const result = await userService.login(
      testUser.username,
      testUser.password
    );

    expect(User.findOne).toHaveBeenCalledWith({ where: { username: testUser.username } });
    expect(bcrypt.compare).toHaveBeenCalledWith(testUser.password, mockDbUser.password);
    expect(result).toHaveProperty("id", 1);
    expect(result.username).toBe(testUser.username);
    expect(result).not.toHaveProperty("password");
  });

  test("should reject login with incorrect credentials", async () => {
    // Mock existing user for login
    (User.findOne as jest.Mock).mockResolvedValueOnce(mockDbUser);

    await expect(
      userService.login(testUser.username, "wrongpassword")
    ).rejects.toThrow("Password is incorrect");
    
    expect(User.findOne).toHaveBeenCalledWith({ where: { username: testUser.username } });
    expect(bcrypt.compare).toHaveBeenCalledWith("wrongpassword", mockDbUser.password);
  });

  test("should get all users", async () => {
    const results = await userService.getAllUsers();

    expect(User.findAll).toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty("id", 1);
    expect(results[0].username).toBe(testUser.username);
    expect(results[0]).not.toHaveProperty("password");
  });

  test("should get user by id", async () => {
    const result = await userService.getUserById(1);

    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(result).toHaveProperty("id", 1);
    expect(result?.username).toBe(testUser.username);
    expect(result).not.toHaveProperty("password");
  });

  test("should return undefined when getting non-existent user", async () => {
    // Mock user not found
    (User.findByPk as jest.Mock).mockResolvedValueOnce(null);

    const result = await userService.getUserById(999);
    
    expect(User.findByPk).toHaveBeenCalledWith(999);
    expect(result).toBeUndefined();
  });

  test("should update user", async () => {
    const updates = { firstName: "Updated", lastName: "Name" };
    
    const result = await userService.updateUser(1, updates);

    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(mockDbUser.update).toHaveBeenCalledWith(updates);
    expect(result).toHaveProperty("id", 1);
  });

  test("should reject updating non-existent user", async () => {
    // Mock user not found
    (User.findByPk as jest.Mock).mockResolvedValueOnce(null);
    
    const updates = { firstName: "Updated", lastName: "Name" };
    
    await expect(userService.updateUser(999, updates)).rejects.toThrow("User not found");
    expect(User.findByPk).toHaveBeenCalledWith(999);
  });

  test("should hash password when updating password", async () => {
    const updates = { password: "newpassword123" };
    
    await userService.updateUser(1, updates);

    expect(bcrypt.genSalt).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith("newpassword123", "salt");
    expect(mockDbUser.update).toHaveBeenCalledWith({ password: "hashedPassword" });
  });

  test("should reject invalid email format when updating", async () => {
    const updates = { email: "invalidemail" };
    
    await expect(userService.updateUser(1, updates)).rejects.toThrow("Invalid email format");
    expect(mockDbUser.update).not.toHaveBeenCalled();
  });

  test("should delete user", async () => {
    await userService.deleteUser(1);

    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(mockDbUser.destroy).toHaveBeenCalled();
  });

  test("should reject deleting non-existent user", async () => {
    // Mock user not found
    (User.findByPk as jest.Mock).mockResolvedValueOnce(null);
    
    await expect(userService.deleteUser(999)).rejects.toThrow("User not found");
    expect(User.findByPk).toHaveBeenCalledWith(999);
  });
});
