import { User } from "../model/user-model";

export class UserService {
  private users: User[] = [];

  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  async addUser(user: User): Promise<User> {
    const newUser = { ...user, id: this.users.length + 1 };
    this.users.push(newUser);
    return newUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async updateUser(
    id: number,
    updatedData: Partial<User>
  ): Promise<User | undefined> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updatedData };
      return this.users[index];
    }
    return undefined;
  }

  async deleteUser(id: number): Promise<User | undefined> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      return this.users.splice(index, 1)[0];
    }
    return undefined;
  }
}
