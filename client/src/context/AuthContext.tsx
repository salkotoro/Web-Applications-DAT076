import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

export enum UserType {
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee'
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserType;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerEmployee: (userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
  }) => Promise<void>;
  registerEmployer: (userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
  }) => Promise<void>;
  updateProfile: (userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    companyName?: string;
    password?: string;
  }) => Promise<void>;
  isEmployer: () => boolean;
  isEmployee: () => boolean;
  isAuthenticated: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post("/api/users/login", {
        username,
        password,
      });
      setUser(response.data);
    } catch (error: any) {
      console.error("Login error:", error);
      
      // If it's an Axios error with a response, extract the server message
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Failed to login. Please try again.");
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/users/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error instanceof Error ? error : new Error("Failed to logout");
    }
  };

  const registerEmployee = async (userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    try {
      const response = await axios.post("/api/users/register", {
        ...userData,
        userType: UserType.EMPLOYEE
      });
      setUser(response.data);
    } catch (error) {
      console.error("Registration error:", error);
      throw error instanceof Error ? error : new Error("Registration failed");
    }
  };

  const registerEmployer = async (userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
  }) => {
    try {
      if (!userData.companyName) {
        throw new Error("Company name is required for employer registration");
      }
      
      const response = await axios.post("/api/users/register", {
        ...userData,
        userType: UserType.EMPLOYER
      });
      setUser(response.data);
    } catch (error) {
      console.error("Registration error:", error);
      throw error instanceof Error ? error : new Error("Registration failed");
    }
  };

  const updateProfile = async (userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    companyName?: string;
    password?: string;
  }) => {
    try {
      if (!user) {
        throw new Error("You must be logged in to update your profile");
      }

      const response = await axios.patch(`/api/users/${user.id}`, userData);
      
      // Update the user state with the new data (except password)
      const { password, ...userDataWithoutPassword } = userData;
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          ...userDataWithoutPassword
        };
      });

      return response.data;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  const isEmployer = () => {
    return user?.userType === UserType.EMPLOYER;
  };

  const isEmployee = () => {
    return user?.userType === UserType.EMPLOYEE;
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/users/me");
        setUser(response.data);
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        registerEmployee,
        registerEmployer,
        updateProfile,
        isEmployer,
        isEmployee,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
