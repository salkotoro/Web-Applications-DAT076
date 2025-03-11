export interface UserDTO {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
  }
  
  export interface User extends UserDTO {
    id: number;
  }
  
  export interface UserResponse extends Omit<User, "password"> {}
  
  export const toDTO = (user: User): UserDTO => {
    return {
      username: user.username,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  };