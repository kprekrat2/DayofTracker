
"use client"; // Make this a client component to use hooks

import { DayOffRequestList } from "@/components/day-off/DayOffRequestList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequestsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const title = user?.role === "admin" ? "All Day-Off Requests" : "My Day-Off Requests";
  const description = user?.role === "admin" 
    ? "View and manage all submitted day-off requests in the system."
    : "View and manage your submitted day-off requests.";

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{user ? title : "Day-Off Requests"}</CardTitle>
          <CardDescription>
            {user ? description : "Please log in to see requests."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? <DayOffRequestList /> : null }
        </CardContent>
      </Card>
    </div>
  );
}
