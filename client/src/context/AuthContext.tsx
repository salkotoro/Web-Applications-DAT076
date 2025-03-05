import React, { createContext, useState, useEffect } from "react";
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
  register: (userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
  }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  axios.defaults.baseURL = "http://localhost:3000";
  axios.defaults.withCredentials = true;

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post("/api/users/login", {
        username,
        password,
      });
      setUser(response.data);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Invalid username or password");
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/users/logout");
      setUser(null);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Failed to logout");
    }
  };

  const register = async (userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    try {
      const response = await axios.post("/api/users/register", userData);
      setUser(response.data);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Registration failed");
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/users/me");
        setUser(response.data);
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
