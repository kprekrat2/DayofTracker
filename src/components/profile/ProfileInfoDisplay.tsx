
"use client";

import React, { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import type { DayOffRequest, Holiday, User, YearStats } from '@/types'; // Import YearStats
import { calculateUserYearStats } from '@/lib/dayoff-utils'; // Import the new utility function
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CalendarCheck, CalendarClock, Info, CalendarX, Gift, MountainSnow, Hourglass } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '../ui/skeleton';


export function ProfileInfoDisplay() {
  const { user } = useAuth();
  const { requests, holidays, isLoading: dataLoading } = useData();

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const previousYear = useMemo(() => currentYear - 1, [currentYear]);

  const defaultYearStats: YearStats = { 
    year: 0, allocatedVacation: 0, allocatedAdditional: 0, 
    spentVacation: 0, spentAdditional: 0, 
    requestedVacation: 0, requestedAdditional: 0, 
    pendingVacation: 0, pendingAdditional: 0, 
    remainingVacation: 0, remainingAdditional: 0, 
    totalApprovedDays: 0 
  };

  const currentYearStats = useMemo(() => {
    if (!user || dataLoading) {
      return { ...defaultYearStats, year: currentYear };
    }
    const userRequests = requests.filter(req => req.userId === user.id);
    return calculateUserYearStats(currentYear, user, userRequests, holidays);
  }, [currentYear, user, requests, holidays, dataLoading, defaultYearStats]);

  const previousYearStats = useMemo(() => {
    if (!user || dataLoading) {
      return { ...defaultYearStats, year: previousYear };
    }
    const userRequests = requests.filter(req => req.userId === user.id);
    return calculateUserYearStats(previousYear, user, userRequests, holidays);
  }, [previousYear, user, requests, holidays, dataLoading, defaultYearStats]);


  if (dataLoading || !user) {
     return (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="shadow-lg rounded-lg">
              <CardHeader>
                <Skeleton className="h-7 w-3/5 mb-1" />
                <Skeleton className="h-4 w-4/5" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-2 w-full mb-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const StatItem: React.FC<{ label: string; value: number; total?: number; icon?: React.ElementType; isPreviousYear?: boolean; isAdditional?: boolean }> = ({ label, value, total, icon: Icon, isPreviousYear = false, isAdditional = false }) => {
    const defaultIcon = isAdditional ? Gift : MountainSnow;
    const DisplayIcon = Icon || defaultIcon;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-muted-foreground flex items-center">
            <DisplayIcon className="mr-2 h-4 w-4 text-primary/80" />
            {label}
          </span>
          <span className="text-sm font-semibold">{value}{total !== undefined && !isPreviousYear ? ` / ${total}` : (isPreviousYear && total !== undefined ? ` of ${total}` : '')}</span>
        </div>
        {total !== undefined && total > 0 && !isPreviousYear && (
          <Progress value={(value / total) * 100} className="h-2" />
        )}
        {total !== undefined && total === 0 && value > 0 && !isPreviousYear && (
          <div className="text-xs text-destructive/80 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1 shrink-0" />
              Days taken exceed allocation (0 days allocated).
          </div>
        )}
        {isPreviousYear && total !== undefined && value > total && (
          <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
            <AlertCircle className="h-3 w-3 mr-1 shrink-0" />
            Exceeded allocated days in {previousYearStats.year}.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl">Current Year ({currentYearStats.year})</CardTitle>
            <CardDescription>Your day-off status for this year.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatItem label="Total Approved Days Off" value={currentYearStats.totalApprovedDays} icon={CalendarCheck}/>
            <hr className="my-3"/>
            <StatItem label="Allocated Vacation Days" value={currentYearStats.allocatedVacation} icon={MountainSnow} />
            <StatItem label="Spent (Approved) Vacation Days" value={currentYearStats.spentVacation} total={currentYearStats.allocatedVacation} />
            <StatItem label="Pending Vacation Days" value={currentYearStats.pendingVacation} icon={Hourglass} />
            <StatItem label="Remaining Vacation Days" value={currentYearStats.remainingVacation} />
            <hr className="my-3"/>
            <StatItem label="Allocated Additional Days" value={currentYearStats.allocatedAdditional} icon={Gift} isAdditional />
            <StatItem label="Spent (Approved) Additional Days" value={currentYearStats.spentAdditional} total={currentYearStats.allocatedAdditional} isAdditional />
            <StatItem label="Pending Additional Days" value={currentYearStats.pendingAdditional} icon={Hourglass} isAdditional />
            <StatItem label="Remaining Additional Days" value={currentYearStats.remainingAdditional} isAdditional />
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl">Previous Year ({previousYearStats.year})</CardTitle>
            <CardDescription>Your day-off usage from last year.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatItem label="Total Approved Days Off" value={previousYearStats.totalApprovedDays} icon={CalendarX} isPreviousYear/>
             <hr className="my-3"/>
            <StatItem label="Allocated Vacation Days" value={previousYearStats.allocatedVacation} icon={MountainSnow} isPreviousYear />
            <StatItem label="Spent (Approved) Vacation Days" value={previousYearStats.spentVacation} total={previousYearStats.allocatedVacation} isPreviousYear />
            <StatItem label="Pending Vacation Days (End of Year)" value={previousYearStats.pendingVacation} icon={Hourglass} isPreviousYear />
            <StatItem label="Unused Vacation Days (End of Year)" value={previousYearStats.remainingVacation} isPreviousYear />
            <hr className="my-3"/>
            <StatItem label="Allocated Additional Days" value={previousYearStats.allocatedAdditional} icon={Gift} isAdditional isPreviousYear/>
            <StatItem label="Spent (Approved) Additional Days" value={previousYearStats.spentAdditional} total={previousYearStats.allocatedAdditional} isAdditional isPreviousYear />
            <StatItem label="Pending Additional Days (End of Year)" value={previousYearStats.pendingAdditional} icon={Hourglass} isAdditional isPreviousYear />
            <StatItem label="Unused Additional Days (End of Year)" value={previousYearStats.remainingAdditional} isAdditional isPreviousYear />
          </CardContent>
        </Card>
      </div>
      
      <Alert variant="default" className="bg-primary/5 border-primary/20 shadow-md">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold text-primary/90">Important Policy Note</AlertTitle>
        <AlertDescription className="text-primary/80">
          Vacation days from the previous year must be utilized by the end of June of the current year. 
          Please plan accordingly to ensure you do not lose any accrued vacation time.
        </AlertDescription>
      </Alert>
    </div>
  );
}

