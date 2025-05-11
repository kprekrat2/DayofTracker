
"use client";

import type { DayOffRequest } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/hooks/useData";
import { DayOffRequestItem } from "./DayOffRequestItem";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export function DayOffRequestList() {
  const { user, isLoading: authLoading } = useAuth();
  const { getRequestsByUserId, getAllRequests, isLoading: dataLoading } = useData();

  if (authLoading || dataLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-muted-foreground">Please log in to view requests.</p>;
  }

  const requestsToDisplay = user.role === "admin" 
    ? getAllRequests() 
    : getRequestsByUserId(user.id);

  if (requestsToDisplay.length === 0) {
    return (
      <div className="text-center py-12">
        <Image 
          src="https://picsum.photos/seed/no-requests-found/300/200"
          alt="No requests found" 
          width={300} 
          height={200} 
          className="mx-auto mb-6 rounded-lg shadow-md"
          data-ai-hint="empty state"
        />
        <h3 className="text-2xl font-semibold mb-2">No Requests Found</h3>
        {user.role === "user" ? (
          <p className="text-muted-foreground">You haven't submitted any day-off requests. <br/>Click "Submit Request" to create your first one!</p>
        ) : (
          <p className="text-muted-foreground">There are currently no day-off requests in the system.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requestsToDisplay.map((request) => (
        <DayOffRequestItem key={request.id} request={request} />
      ))}
    </div>
  );
}
