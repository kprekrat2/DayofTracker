
"use client";

import { DayOffCalendar } from "@/components/day-off/DayOffCalendar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[400px] w-full bg-muted rounded-md" />
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <DayOffCalendar />
    </div>
  );
}
