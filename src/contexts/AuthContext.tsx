
"use client";

import type { User } from "@/types";
import React, { createContext, useState, ReactNode, useCallback, useEffect } from "react";
import { useData } from "@/hooks/useData"; // Import useData
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, passwordParam: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true until initial check
  const dataContext = useData(); 
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for an existing session or initial auth status.
    // In a real app, you might check localStorage or make an API call.
    // For this example, we assume no persistent session and start unauthenticated.
    setUser(null);
    setIsLoading(false); // Done with initial check
  }, []);

  const login = useCallback(async (email: string, passwordParam: string): Promise<boolean> => {
    if (!dataContext) {
      console.error("DataContext not available in AuthContext");
      setIsLoading(false); // Ensure loading is false on error
      return false;
    }
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const users = dataContext.users;
    const foundUser = users.find(u => u.email === email);

    if (foundUser && foundUser.password === passwordParam) { // Plain text password comparison (NOT FOR PRODUCTION)
      setUser(foundUser);
      setIsLoading(false);
      return true;
    } else {
      setUser(null);
      setIsLoading(false);
      return false;
    }
  }, [dataContext]);

  const logout = useCallback(() => {
    setIsLoading(true);
    setUser(null);
    // In a real app, also clear any session/token
    setIsLoading(false);
    router.push('/login'); // Redirect to login page after logout
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
