import bcrypt from "bcrypt";
import { User as UserModel, UserDTO, UserResponse, UserType } from "../models/User";
import { User } from "../../db/user.db";

export class UserService {
  async register(user: UserDTO): Promise<UserResponse> {
    // Check if username exists
    const existingUser = await User.findOne({ where: { username: user.username } });
    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Additional validation for employer
    if (user.userType === UserType.EMPLOYER && !user.companyName) {
      throw new Error("Company name is required for employer registration");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // Create new user in db
    const newUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    // Return user without password
    const userResponse: UserResponse = {
      id: newUser.id,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      userType: newUser.userType as UserType,
      companyName: newUser.companyName || undefined,
    };

    return userResponse;
  }

  async login(username: string, password: string): Promise<UserResponse> {
    const user = await User.findOne({ where: { username } });
    if (!user) throw new Error("Username does not exist");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Password is incorrect");

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType as UserType,
      companyName: user.companyName || undefined,
    };
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await User.findAll();
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType as UserType,
      companyName: user.companyName || undefined,
    }));
  }

  async getUserById(id: number): Promise<UserResponse | undefined> {
    const user = await User.findByPk(id);
    if (!user) return undefined;

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType as UserType,
      companyName: user.companyName || undefined,
    };
  }

  async updateUser(
    id: number,
    updates: Partial<UserDTO>
  ): Promise<UserResponse> {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");

    // Validate email format if it's being updated
    if (updates.email && !updates.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error("Invalid email format");
    }

    // Additional validation for employer type change
    if (updates.userType === UserType.EMPLOYER && !updates.companyName && !user.companyName) {
      throw new Error("Company name is required for employer accounts");
    }

    // Handle password update
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // Update user
    await user.update(updates);

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType as UserType,
      companyName: user.companyName || undefined,
    };
  }

  async deleteUser(id: number): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");
    
    await user.destroy();
  }
}

export const userService = new UserService();
