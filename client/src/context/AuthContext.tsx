import React, { createContext, useState } from "react";
import axios from "../api/axios";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    userData: Omit<User, "id"> & { password: string }
  ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    const response = await axios.post("/users/login", { username, password });
    setUser(response.data);
  };

  const logout = async () => {
    await axios.post("/users/logout");
    setUser(null);
  };

  const register = async (
    userData: Omit<User, "id"> & { password: string }
  ) => {
    await axios.post("/users/register", userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
