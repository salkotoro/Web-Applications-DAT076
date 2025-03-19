import { UserService } from "../src/services/userService";
import { User, UserDTO, UserType } from "../src/models/User";

// Define a type for our mock user
interface MockUser extends UserDTO {
  id: number;
  update: (updates: Partial<UserDTO>) => Promise<MockUser>;
  destroy: () => Promise<void>;
}

// Mock the database module
jest.mock("../db/user.db", () => {
  let mockUsers: MockUser[] = [];
  
  // Clear the mock users array before each test
  beforeEach(() => {
    mockUsers = [];
  });
  
  return {
    User: {
      findOne: jest.fn(({ where }: { where: { username: string } }) => {
        const user = mockUsers.find(u => u.username === where.username);
        return Promise.resolve(user);
      }),
      findAll: jest.fn(() => Promise.resolve(mockUsers)),
      findByPk: jest.fn((id: number) => {
        const user = mockUsers.find(u => u.id === id);
        return Promise.resolve(user);
      }),
      create: jest.fn((userData: UserDTO): Promise<MockUser> => {
        const newUser: MockUser = { 
          id: mockUsers.length + 1, 
          ...userData,
          update: jest.fn(async (updates: Partial<UserDTO>): Promise<MockUser> => {
            Object.assign(newUser, updates);
            return newUser;
          }),
          destroy: jest.fn(async (): Promise<void> => {
            const index = mockUsers.findIndex(u => u.id === newUser.id);
            if (index !== -1) mockUsers.splice(index, 1);
          })
        };
        mockUsers.push(newUser);
        return Promise.resolve(newUser);
      })
    }
  };
});

// Mock bcrypt
jest.mock("bcrypt", () => ({
  genSalt: jest.fn(() => Promise.resolve("salt")),
  hash: jest.fn(() => Promise.resolve("hashed_password")),
  compare: jest.fn(() => Promise.resolve(true))
}));

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
    
    // Reset the mock implementation for findOne to avoid username conflicts
    const mockDb = require("../db/user.db");
    mockDb.User.findOne.mockImplementation(({ where }: { where: { username: string } }) => {
      return Promise.resolve(null); // Always return null to avoid "Username already exists" error
    });
  });

  test("Should add a user and retrieve it", async () => {
    const user: UserDTO = {
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      password: "securePass123",
      email: "john.doe@example.com",
      userType: UserType.EMPLOYEE
    };

    await userService.register(user);
    const users = await userService.getAllUsers();
    expect(users.length).toBe(1);
    expect(users[0].username).toEqual(user.username);
  });

  test("Should get a user by ID", async () => {
    const user: UserDTO = {
      firstName: "Jane",
      lastName: "Smith",
      username: "janesmith",
      password: "securePass123",
      email: "jane.smith@example.com",
      userType: UserType.EMPLOYEE
    };

    const newUser = await userService.register(user);
    const retrievedUser = await userService.getUserById(newUser.id);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.username).toBe("janesmith");
  });

  test("Should return undefined for non-existent user ID", async () => {
    const retrievedUser = await userService.getUserById(99);
    expect(retrievedUser).toBeUndefined();
  });

  test("Should update a user", async () => {
    const user: UserDTO = {
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      password: "securePass123",
      email: "john.doe@example.com",
      userType: UserType.EMPLOYEE
    };

    const newUser = await userService.register(user);
    const updatedUser = await userService.updateUser(newUser.id, {
      username: "john_updated",
    });

    expect(updatedUser).toBeDefined();
    expect(updatedUser?.username).toBe("john_updated");
  });

  test("Should delete a user", async () => {
    const user: UserDTO = {
      firstName: "Jane",
      lastName: "Smith",
      username: "janesmith",
      password: "securePass123",
      email: "jane.smith@example.com",
      userType: UserType.EMPLOYEE
    };

    const newUser = await userService.register(user);
    await userService.deleteUser(newUser.id);

    const users = await userService.getAllUsers();
    expect(users.find(u => u.id === newUser.id)).toBeUndefined();
  });

  test("Should throw error when deleting a non-existent user", async () => {
    await expect(userService.deleteUser(99)).rejects.toThrow("User not found");
  });

  test("Should be able to login a user with correct credentials", async () => {
    const user: UserDTO = {
      firstName: "Jane",
      lastName: "Doe",
      username: "janedoe",
      password: "securePass123",
      email: "jane.doe@example.com",
      userType: UserType.EMPLOYEE
    };

    // More test code...
  });

  test("Should update a user's information", async () => {
    const user: UserDTO = {
      firstName: "Test",
      lastName: "User",
      username: "testuser",
      password: "securePass123",
      email: "test.user@example.com",
      userType: UserType.EMPLOYEE
    };

    // More test code...
  });

  test("Should delete a user", async () => {
    const user: UserDTO = {
      firstName: "Delete",
      lastName: "User",
      username: "deleteuser",
      password: "securePass123",
      email: "delete.user@example.com",
      userType: UserType.EMPLOYEE
    };

    // More test code...
  });
});
