
"use client";

import type { DayOffRequest, Holiday, DayOffStatus, User } from "@/types";
import React, { createContext, useState, ReactNode, useEffect } from "react";

interface DataContextType {
  requests: DayOffRequest[];
  holidays: Holiday[];
  isLoading: boolean;
  addRequest: (request: Omit<DayOffRequest, "id" | "createdAt" | "userId" > & { userId: string }) => DayOffRequest;
  updateRequestStatus: (requestId: string, status: DayOffStatus) => void;
  getRequestsByUserId: (userId: string) => DayOffRequest[];
  getAllRequests: () => DayOffRequest[]; // New function for admin
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

const MOCK_USER_TWO: User = {
  id: "user_456",
  name: "Jane Colleague",
  email: "jane.colleague@example.com",
  role: "user",
};


export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [requests, setRequests] = useState<DayOffRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize mock data on the client side to avoid hydration mismatches
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
        userId: "user_123", // Demo Employee
        startDate: new Date(new Date(today).setDate(today.getDate() + 10)),
        endDate: new Date(new Date(today).setDate(today.getDate() + 11)),
        reason: "Vacation for Demo Employee",
        status: "approved",
        createdAt: new Date(new Date(today).setDate(today.getDate() - 2)),
      },
      {
        id: "req_2",
        userId: "user_123", // Demo Employee
        startDate: new Date(new Date(today).setDate(today.getDate() - 5)),
        endDate: new Date(new Date(today).setDate(today.getDate() - 5)),
        reason: "Personal day for Demo Employee",
        status: "pending",
        createdAt: new Date(new Date(today).setDate(today.getDate() - 7)),
      },
      {
        id: "req_3",
        userId: MOCK_USER_TWO.id, // Jane Colleague
        startDate: new Date(new Date(today).setDate(today.getDate() + 15)),
        endDate: new Date(new Date(today).setDate(today.getDate() + 17)),
        reason: "Conference trip for Jane",
        status: "pending",
        createdAt: new Date(new Date(today).setDate(today.getDate() - 1)),
      },
      {
        id: "req_4",
        userId: MOCK_USER_TWO.id, // Jane Colleague
        startDate: new Date(new Date(today).setDate(today.getDate() + 2)),
        endDate: new Date(new Date(today).setDate(today.getDate() + 3)),
        reason: "Medical appointment for Jane",
        status: "approved",
        createdAt: new Date(new Date(today).setDate(today.getDate() - 3)),
      },
    ];

    setHolidays(MOCK_HOLIDAYS_DATA);
    setRequests(INITIAL_REQUESTS_DATA);
    setIsLoading(false);
  }, []);

  const addRequest = (requestData: Omit<DayOffRequest, "id" | "createdAt" | "userId"> & { userId: string }) => {
    const newRequest: DayOffRequest = {
      ...requestData,
      id: `req_${Date.now()}`,
      createdAt: new Date(),
      status: "pending", // Default status
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
    return requests.filter(req => req.userId === userId).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const getAllRequests = () => {
    return [...requests].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  return (
    <DataContext.Provider value={{ requests, holidays, isLoading, addRequest, updateRequestStatus, getRequestsByUserId, getAllRequests }}>
      {children}
    </DataContext.Provider>
  );
};
