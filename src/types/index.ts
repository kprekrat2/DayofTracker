
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  password?: string; // Password is optional as it's sensitive and might not always be fetched/present
  vacationDays?: number; // Total vacation days
  additionalDays?: number; // Additional days off (e.g., blood donation)
}

export type DayOffStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface DayOffRequest {
  id: string;
  userId: string;
  userName?: string; // Optional: for admin to see user's name easily
  userEmail?: string; // Optional: for admin to see user's email easily
  startDate: Date;
  endDate: Date;
  reason: string;
  status: DayOffStatus;
  requestType?: "vacation" | "additional"; // Added to distinguish request type
  aiSuggestions?: string[];
  createdAt: Date;
}

export interface Holiday {
  id: string;
  name: string;
  date: Date;
}
