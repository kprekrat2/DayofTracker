"use client";

import type { DayOffRequest, Holiday, DayOffStatus } from "@/types";
import React, { createContext, useState, ReactNode, useEffect } from "react";

interface DataContextType {
  requests: DayOffRequest[];
  holidays: Holiday[];
  isLoading: boolean;
  addRequest: (request: Omit<DayOffRequest, "id" | "createdAt" | "userId" > & { userId: string }) => DayOffRequest;
  updateRequestStatus: (requestId: string, status: DayOffStatus) => void;
  getRequestsByUserId: (userId: string) => DayOffRequest[];
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

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
        userId: "user_123", // Assuming MOCK_USER.id
        startDate: new Date(new Date(today).setDate(today.getDate() + 10)),
        endDate: new Date(new Date(today).setDate(today.getDate() + 11)),
        reason: "Vacation",
        status: "approved",
        createdAt: new Date(),
      },
      {
        id: "req_2",
        userId: "user_123",
        startDate: new Date(new Date(today).setDate(today.getDate() - 5)),
        endDate: new Date(new Date(today).setDate(today.getDate() - 5)),
        reason: "Personal day",
        status: "pending",
        createdAt: new Date(new Date(today).setDate(today.getDate() - 7)),
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
  }

  return (
    <DataContext.Provider value={{ requests, holidays, isLoading, addRequest, updateRequestStatus, getRequestsByUserId }}>
      {children}
    </DataContext.Provider>
  );
};

