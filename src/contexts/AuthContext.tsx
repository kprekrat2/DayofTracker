
"use client";

import type { User } from "@/types";
import React, { createContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock a user for demonstration purposes
const MOCK_USER: User = {
  id: "user_123",
  name: "Demo Employee",
  email: "employee@example.com",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data
    setTimeout(() => {
      // For now, automatically log in the mock user
      setUser(MOCK_USER);
      setIsLoading(false);
    }, 500);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
