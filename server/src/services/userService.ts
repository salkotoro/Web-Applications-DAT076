import bcrypt from "bcrypt";
import { User, UserDTO, UserResponse } from "../models/User";

export class UserService {
  private users: User[] = [];
  private nextId = 1;

  async register(user: UserDTO): Promise<UserResponse> {
    if (this.users.find((u) => u.username === user.username)) {
      throw new Error("Username already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const newUser: User = {
      id: this.nextId++,
      ...user,
      password: hashedPassword,
    };

    this.users.push(newUser);
    const { password, ...userResponse } = newUser;
    return userResponse;
  }

  async login(username: string, password: string): Promise<UserResponse> {
    const user = this.users.find((u) => u.username === username);
    if (!user) throw new Error("Invalid username or password");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid username or password");

    const { password: _, ...userResponse } = user;
    return userResponse;
  }

  async getAllUsers(): Promise<UserResponse[]> {
    return this.users.map(({ password, ...user }) => user);
  }

  async getUserById(id: number): Promise<UserResponse | undefined> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return undefined;
    const { password, ...userResponse } = user;
    return userResponse;
  }

  async updateUser(
    id: number,
    updates: Partial<UserDTO>
  ): Promise<UserResponse> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) throw new Error("User not found");

    // Validate email format if it's being updated
    if (updates.email && !updates.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error("Invalid email format");
    }

    const user = this.users[userIndex];
    const updatedUser = { ...user, ...updates };

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updatedUser.password = await bcrypt.hash(updates.password, salt);
    }

    this.users[userIndex] = updatedUser;
    const { password, ...userResponse } = updatedUser;
    return userResponse;
  }

  async deleteUser(id: number): Promise<void> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");
    this.users.splice(index, 1);
  }
}

export const userService = new UserService();
