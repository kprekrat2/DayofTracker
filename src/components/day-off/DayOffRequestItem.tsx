
"use client";

import type { DayOffRequest } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useData } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { Ban, CalendarDays, FileText } from "lucide-react";

interface DayOffRequestItemProps {
  request: DayOffRequest;
}

export function DayOffRequestItem({ request }: DayOffRequestItemProps) {
  const { updateRequestStatus } = useData();
  const { toast } = useToast();

  const handleCancelRequest = () => {
    if (request.status === "pending") {
      updateRequestStatus(request.id, "cancelled");
      toast({
        title: "Request Cancelled",
        description: "Your day-off request has been cancelled.",
      });
    }
  };

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
            </CardDescription>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="break-all">Reason: {request.reason}</p>
        </div>
        {request.aiSuggestions && request.aiSuggestions.length > 0 && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <h4 className="text-xs font-semibold text-amber-700 mb-1">AI Suggested Rejection Reasons:</h4>
            <ul className="list-disc list-inside text-xs text-amber-600">
              {request.aiSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      {request.status === "pending" && (
        <CardFooter>
          <Button variant="outline" size="sm" onClick={handleCancelRequest} className="text-destructive border-destructive hover:bg-destructive/10">
            <Ban className="mr-2 h-4 w-4" />
            Cancel Request
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
