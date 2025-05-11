
"use client";

import type { DayOffRequest } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useData } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Ban, CalendarDays, FileText, CheckCircle2, XCircle, Tag } from "lucide-react";

interface DayOffRequestItemProps {
  request: DayOffRequest;
}

export function DayOffRequestItem({ request }: DayOffRequestItemProps) {
  const { updateRequestStatus } = useData();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCancelRequest = () => {
    updateRequestStatus(request.id, "cancelled");
    toast({
      title: "Request Cancelled",
      description: "Your day-off request has been cancelled.",
    });
  };

  const handleApproveRequest = () => {
    updateRequestStatus(request.id, "approved");
    toast({
      title: "Request Approved",
      description: `The day-off request for ${format(request.startDate, "PPP")} to ${format(request.endDate, "PPP")} has been approved.`,
      variant: "default",
    });
  };

  const handleRejectRequest = () => {
    updateRequestStatus(request.id, "rejected");
    toast({
      title: "Request Rejected",
      description: `The day-off request for ${format(request.startDate, "PPP")} to ${format(request.endDate, "PPP")} has been rejected.`,
      variant: "destructive", 
    });
  };

  const showAdminActions = user?.role === 'admin' && request.status === 'pending';
  const showUserCancelAction = user?.id === request.userId && request.status === 'pending';

  const requestTypeLabel = request.requestType === "vacation" ? "Vacation Day" : 
                           request.requestType === "additional" ? "Additional Day" : "N/A";

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {format(request.startDate, "MMMM d, yyyy")} - {format(request.endDate, "MMMM d, yyyy")}
            </CardTitle>
            <CardDescription>
              Submitted on {format(request.createdAt, "MMMM d, yyyy, p")}
              {user?.role === 'admin' && request.userName && (
                <span className="block text-xs">By: {request.userName} ({request.userEmail})</span>
              )}
            </CardDescription>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="break-all">Reason: {request.reason}</p>
        </div>
         {request.requestType && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4 shrink-0" />
            <p>Type: {requestTypeLabel}</p>
          </div>
        )}
        {request.aiSuggestions && request.aiSuggestions.length > 0 && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-900/30 dark:border-amber-700">
            <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">AI Suggested Rejection Reasons:</h4>
            <ul className="list-disc list-inside text-xs text-amber-600 dark:text-amber-400">
              {request.aiSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      {(showAdminActions || showUserCancelAction) && (
        <CardFooter className="flex flex-wrap gap-2 justify-start">
          {showAdminActions && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleApproveRequest} 
                className="text-accent border-accent hover:bg-accent/10 dark:text-accent dark:border-accent dark:hover:bg-accent/20"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRejectRequest}
                className="text-destructive border-destructive hover:bg-destructive/10 dark:text-destructive dark:border-destructive dark:hover:bg-destructive/20"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          {showUserCancelAction && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancelRequest} 
              className="text-destructive border-destructive hover:bg-destructive/10 dark:text-destructive dark:border-destructive dark:hover:bg-destructive/20"
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancel Request
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
