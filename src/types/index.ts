
export interface User {
  id: string;
  name: string;
  email: string;
}

export type DayOffStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface DayOffRequest {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: DayOffStatus;
  aiSuggestions?: string[];
  createdAt: Date;
}

export interface Holiday {
  id: string;
  name: string;
  date: Date;
}
