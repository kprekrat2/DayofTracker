
"use client";

import React, { useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import type { DayOffRequest, Holiday } from '@/types';
import {
  eachDayOfInterval,
  endOfYear,
  format,
  isWeekend,
  max as dateMax,
  min as dateMin,
  startOfYear,
} from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CalendarCheck, CalendarClock, Info, CalendarX, Gift, MountainSnow } from 'lucide-react'; // Added Gift, MountainSnow
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface YearStats {
  year: number;
  allocatedVacation: number;
  allocatedAdditional: number;
  spentVacation: number;
  spentAdditional: number;
  remainingVacation: number;
  remainingAdditional: number;
  totalApprovedDays: number;
}

function countBusinessDays(startDate: Date, endDate: Date, holidays: Holiday[]): number {
  if (startDate > endDate) return 0;
  let count = 0;
  const holidayDates = holidays.map(h => format(h.date, 'yyyy-MM-dd'));
  const interval = eachDayOfInterval({ start: startDate, end: endDate });

  for (const day of interval) {
    if (!isWeekend(day) && !holidayDates.includes(format(day, 'yyyy-MM-dd'))) {
      count++;
    }
  }
  return count;
}

export function ProfileInfoDisplay() {
  const { user } = useAuth();
  const { requests, holidays, isLoading: dataLoading } = useData();

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const previousYear = useMemo(() => currentYear - 1, [currentYear]);

  const calculateYearStats = useCallback((year: number): YearStats => {
    if (!user || dataLoading) {
      return {
        year,
        allocatedVacation: 0,
        allocatedAdditional: 0,
        spentVacation: 0,
        spentAdditional: 0,
        remainingVacation: 0,
        remainingAdditional: 0,
        totalApprovedDays: 0,
      };
    }

    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 11, 31));

    const approvedRequests = requests.filter(
      (req) => req.userId === user.id && req.status === 'approved'
    );

    let spentVacationBusinessDays = 0;
    let spentAdditionalBusinessDays = 0;

    approvedRequests.forEach((req) => {
      const overlapStart = dateMax([new Date(req.startDate), yearStart]);
      const overlapEnd = dateMin([new Date(req.endDate), yearEnd]);
      if (overlapStart <= overlapEnd) {
        const businessDaysInOverlap = countBusinessDays(overlapStart, overlapEnd, holidays);
        // Default to 'vacation' if requestType is undefined (for older requests)
        const type = req.requestType || "vacation"; 

        if (type === "vacation") {
          spentVacationBusinessDays += businessDaysInOverlap;
        } else if (type === "additional") {
          spentAdditionalBusinessDays += businessDaysInOverlap;
        }
      }
    });
    
    const allocatedVacation = user.vacationDays || 0;
    const allocatedAdditional = user.additionalDays || 0;

    const spentVacation = spentVacationBusinessDays;
    const spentAdditional = spentAdditionalBusinessDays;
    const totalApprovedDays = spentVacation + spentAdditional; 
        
    return {
      year,
      allocatedVacation,
      allocatedAdditional,
      spentVacation,
      spentAdditional,
      remainingVacation: Math.max(0, allocatedVacation - spentVacation),
      remainingAdditional: Math.max(0, allocatedAdditional - spentAdditional),
      totalApprovedDays,
    };
  }, [user, requests, holidays, dataLoading]);

  const currentYearStats = useMemo(() => calculateYearStats(currentYear), [calculateYearStats, currentYear]);
  const previousYearStats = useMemo(() => calculateYearStats(previousYear), [calculateYearStats, previousYear]);

  if (dataLoading || !user) {
    return <p>Loading user data...</p>; // Or a more elaborate skeleton
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
            <StatItem label="Spent Vacation Days" value={currentYearStats.spentVacation} total={currentYearStats.allocatedVacation} />
            <StatItem label="Remaining Vacation Days" value={currentYearStats.remainingVacation} />
            <hr className="my-3"/>
            <StatItem label="Allocated Additional Days" value={currentYearStats.allocatedAdditional} icon={Gift} isAdditional />
            <StatItem label="Spent Additional Days" value={currentYearStats.spentAdditional} total={currentYearStats.allocatedAdditional} isAdditional />
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
            <StatItem label="Spent Vacation Days" value={previousYearStats.spentVacation} total={previousYearStats.allocatedVacation} isPreviousYear />
            <StatItem label="Unused Vacation Days (End of Year)" value={previousYearStats.remainingVacation} isPreviousYear />
            <hr className="my-3"/>
            <StatItem label="Allocated Additional Days" value={previousYearStats.allocatedAdditional} icon={Gift} isAdditional isPreviousYear/>
            <StatItem label="Spent Additional Days" value={previousYearStats.spentAdditional} total={previousYearStats.allocatedAdditional} isAdditional isPreviousYear />
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
