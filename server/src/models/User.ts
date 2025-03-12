export interface UserDTO {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserType;
  companyName?: string;  // Required for employers
}

export enum UserType {
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee'
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  userType: UserType;
  companyName?: string;  // Required for employers
}

export interface UserResponse extends Omit<User, "password"> {}

export const toDTO = (user: User): UserDTO => {
  return {
    username: user.username,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType,
    companyName: user.companyName,
  };
};
