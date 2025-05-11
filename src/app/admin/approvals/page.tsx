
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/hooks/useData";
import { DayOffRequestItem } from "@/components/day-off/DayOffRequestItem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import type { DayOffRequest } from "@/types";

export default function AdminApprovalsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { getAllRequests, isLoading: dataLoading } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/'); 
    }
  }, [user, authLoading, router]);

  const pendingRequests = useMemo(() => {
    if (dataLoading || !user || user.role !== 'admin') return [];
    // Ensure getAllRequests returns an array before filtering
    const allRequests = getAllRequests();
    if (!Array.isArray(allRequests)) return [];
    return allRequests.filter((req: DayOffRequest) => req.status === "pending");
  }, [getAllRequests, dataLoading, user]);


  if (authLoading || dataLoading || !user || user.role !== 'admin') {
    return (
      <div className="space-y-8">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Manage Day-Off Approvals</CardTitle>
          <CardDescription>
            Review and process pending day-off requests from all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <Image 
                src="https://picsum.photos/seed/no-pending-approvals/300/200" 
                alt="No pending requests" 
                width={300} 
                height={200} 
                className="mx-auto mb-6 rounded-lg shadow-md"
                data-ai-hint="empty inbox"
              />
              <h3 className="text-2xl font-semibold mb-2">All Clear!</h3>
              <p className="text-muted-foreground">There are currently no pending day-off requests to review.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingRequests.map((request) => (
                <DayOffRequestItem key={request.id} request={request} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

