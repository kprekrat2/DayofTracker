
"use client";

import type { DayOffRequest, Holiday, DayOffStatus, User } from "@/types";
import React, { createContext, useState, ReactNode, useEffect, useMemo } from "react";

interface DataContextType {
  requests: DayOffRequest[];
  holidays: Holiday[];
  isLoading: boolean;
  addRequest: (request: Omit<DayOffRequest, "id" | "createdAt" | "userId" | "userName" | "userEmail" > & { userId: string }) => DayOffRequest;
  updateRequestStatus: (requestId: string, status: DayOffStatus) => void;
  getRequestsByUserId: (userId: string) => DayOffRequest[];
  getAllRequests: () => DayOffRequest[];
  users: User[]; // Expose users for admin view
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock users for demonstration purposes
const MOCK_REGULAR_USER: User = {
  id: "user_123",
  name: "Demo Employee",
  email: "employee@example.com",
  role: "user",
};

const MOCK_ADMIN_USER: User = { // This user is defined in AuthContext, but we need a list of all users
  id: "admin_007",
  name: "Admin Manager",
  email: "admin@example.com",
  role: "admin",
};

const MOCK_USER_TWO: User = {
  id: "user_456",
  name: "Jane Colleague",
  email: "jane.colleague@example.com",
  role: "user",
};

const ALL_MOCK_USERS = [MOCK_REGULAR_USER, MOCK_ADMIN_USER, MOCK_USER_TWO];


export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [requests, setRequests] = useState<DayOffRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const usersById = useMemo(() => {
    return ALL_MOCK_USERS.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, User>);
  }, []);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const MOCK_HOLIDAYS_DATA: Holiday[] = [
      { id: "holiday_1", name: "New Year's Day", date: new Date(currentYear, 0, 1) },
      { id: "holiday_2", name: "Independence Day", date: new Date(currentYear, 6, 4) },
      { id: "holiday_3", name: "Christmas Day", date: new Date(currentYear, 11, 25) },
    ];

    const today = new Date();
    const INITIAL_REQUESTS_DATA: DayOffRequest[] = [
      {
        id: "req_1",
        userId: MOCK_REGULAR_USER.id, 
        startDate: new Date(new Date(today).setDate(today.getDate() + 10)),
        endDate: new Date(new Date(today).setDate(today.getDate() + 11)),
        reason: "Vacation for Demo Employee",
        status: "approved",
        createdAt: new Date(new Date(today).setDate(today.getDate() - 2)),
      },
      {
        id: "req_2",
        userId: MOCK_REGULAR_USER.id,
        startDate: new Date(new Date(today).setDate(today.getDate() - 5)),
        endDate: new Date(new Date(today).setDate(today.getDate() - 5)),
        reason: "Personal day for Demo Employee",
        status: "pending",
        createdAt: new Date(new Date(today).setDate(today.getDate() - 7)),
      },
      {
        id: "req_3",
        userId: MOCK_USER_TWO.id,
        startDate: new Date(new Date(today).setDate(today.getDate() + 15)),
        endDate: new Date(new Date(today).setDate(today.getDate() + 17)),
        reason: "Conference trip for Jane",
        status: "pending",
        createdAt: new Date(new Date(today).setDate(today.getDate() - 1)),
      },
      {
        id: "req_4",
        userId: MOCK_USER_TWO.id, 
        startDate: new Date(new Date(today).setDate(today.getDate() + 2)),
        endDate: new Date(new Date(today).setDate(today.getDate() + 3)),
        reason: "Medical appointment for Jane",
        status: "approved",
        createdAt: new Date(new Date(today).setDate(today.getDate() - 3)),
      },
       {
        id: "req_5",
        userId: MOCK_ADMIN_USER.id, 
        startDate: new Date(new Date(today).setDate(today.getDate() + 5)),
        endDate: new Date(new Date(today).setDate(today.getDate() + 6)),
        reason: "Admin taking a break",
        status: "pending",
        createdAt: new Date(new Date(today).setDate(today.getDate() - 1)),
      },
    ];

    setHolidays(MOCK_HOLIDAYS_DATA);
    setRequests(INITIAL_REQUESTS_DATA);
    setIsLoading(false);
  }, []);

  const addRequest = (requestData: Omit<DayOffRequest, "id" | "createdAt" | "userId" | "userName" | "userEmail"> & { userId: string }) => {
    const requestingUser = usersById[requestData.userId];
    const newRequest: DayOffRequest = {
      ...requestData,
      id: `req_${Date.now()}`,
      createdAt: new Date(),
      status: "pending",
      userName: requestingUser?.name,
      userEmail: requestingUser?.email,
    };
    setRequests((prevRequests) => [newRequest, ...prevRequests]);
    return newRequest;
  };

  const updateRequestStatus = (requestId: string, status: DayOffStatus) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId ? { ...req, status } : req
      )
    );
  };

  const getRequestsByUserId = (userId: string) => {
    return requests
      .filter(req => req.userId === userId)
      .map(req => ({
        ...req,
        userName: usersById[req.userId]?.name,
        userEmail: usersById[req.userId]?.email,
      }))
      .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const getAllRequests = () => {
    return requests
      .map(req => ({
        ...req,
        userName: usersById[req.userId]?.name,
        userEmail: usersById[req.userId]?.email,
      }))
      .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  return (
    <DataContext.Provider value={{ requests, holidays, isLoading, addRequest, updateRequestStatus, getRequestsByUserId, getAllRequests, users: ALL_MOCK_USERS }}>
      {children}
    </DataContext.Provider>
  );
};
