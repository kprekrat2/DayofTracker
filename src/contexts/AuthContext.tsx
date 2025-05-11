
"use client";

import type { User } from "@/types";
import React, { createContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginAsAdmin: () => void;
  loginAsUser: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration purposes
const MOCK_REGULAR_USER: User = {
  id: "user_123",
  name: "Demo Employee",
  email: "employee@example.com",
  role: "user",
};

const MOCK_ADMIN_USER: User = {
  id: "admin_007",
  name: "Admin Manager",
  email: "admin@example.com",
  role: "admin",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // isLoading is false as login is synchronous for mock users
  const [isLoading, setIsLoading] = useState(false);

  const loginAsAdmin = () => {
    setIsLoading(true);
    setUser(MOCK_ADMIN_USER);
    setIsLoading(false);
  };

  const loginAsUser = () => {
    setIsLoading(true);
    setUser(MOCK_REGULAR_USER);
    setIsLoading(false);
  };

  const logout = () => {
    setIsLoading(true);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAsAdmin, loginAsUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
