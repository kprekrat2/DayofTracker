
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ProfileInfoDisplay } from "@/components/profile/ProfileInfoDisplay";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IdCard } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IdCard className="h-7 w-7 text-primary" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </CardContent>
            </Card>
          </div>
           <Card>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
            <IdCard className="h-7 w-7 text-primary" /> My Day-Off Summary
        </CardTitle>
        <CardDescription>
          Overview of your day-off entitlements and usage for the current and next year.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileInfoDisplay />
      </CardContent>
    </Card>
  );
}
