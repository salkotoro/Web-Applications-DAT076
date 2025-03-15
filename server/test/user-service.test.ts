import { UserService } from "../src/service/user-service";
import { User } from "../src/model/user-model";

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  test("Should add a user and retrieve it", async () => {
    const user: User = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      password: "securePass123",
      email: "john.doe@example.com",
    };

    await userService.addUser(user);
    const users = await userService.getUsers();
    expect(users.length).toBe(1);
    expect(users[0]).toEqual(user);
  });

  test("Should get a user by ID", async () => {
    const user: User = {
      id: 1,
      firstName: "Jane",
      lastName: "Smith",
      username: "janesmith",
      password: "securePass123",
      email: "jane.smith@example.com",
    };

    await userService.addUser(user);
    const retrievedUser = await userService.getUserById(1);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.username).toBe("janesmith");
  });

  test("Should return undefined for non-existent user ID", async () => {
    const retrievedUser = await userService.getUserById(99);
    expect(retrievedUser).toBeUndefined();
  });

  test("Should update a user", async () => {
    const user: User = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      password: "securePass123",
      email: "john.doe@example.com",
    };

    await userService.addUser(user);
    const updatedUser = await userService.updateUser(1, {
      username: "john_updated",
    });

    expect(updatedUser).toBeDefined();
    expect(updatedUser?.username).toBe("john_updated");
  });

  test("Should delete a user", async () => {
    const user: User = {
      id: 1,
      firstName: "Jane",
      lastName: "Smith",
      username: "janesmith",
      password: "securePass123",
      email: "jane.smith@example.com",
    };

    await userService.addUser(user);
    const deletedUser = await userService.deleteUser(1);

    expect(deletedUser).toBeDefined();
    expect(deletedUser?.id).toBe(1);

    const users = await userService.getUsers();
    expect(users.length).toBe(0);
  });

  test("Should return undefined when deleting a non-existent user", async () => {
    const deletedUser = await userService.deleteUser(99);
    expect(deletedUser).toBeUndefined();
  });
});