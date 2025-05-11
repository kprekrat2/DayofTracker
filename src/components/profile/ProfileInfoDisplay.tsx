
"use client";

import React, { useMemo, useCallback } from 'react'; // Added useCallback here
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import type { DayOffRequest, Holiday } from '@/types';
import {
  addDays,
  eachDayOfInterval,
  endOfYear,
  format,
  getDay,
  getYear,
  isSameDay,
  isWeekend,
  max as dateMax,
  min as dateMin,
  startOfYear,
} from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CalendarCheck, CalendarPlus, Info } from 'lucide-react';
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
  const nextYear = useMemo(() => currentYear + 1, [currentYear]);

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

    let totalBusinessDaysInYear = 0;
    approvedRequests.forEach((req) => {
      const overlapStart = dateMax([new Date(req.startDate), yearStart]);
      const overlapEnd = dateMin([new Date(req.endDate), yearEnd]);
      if (overlapStart <= overlapEnd) {
        totalBusinessDaysInYear += countBusinessDays(overlapStart, overlapEnd, holidays);
      }
    });
    
    const allocatedVacation = user.vacationDays || 0;
    const allocatedAdditional = user.additionalDays || 0;

    let spentVacation = 0;
    let spentAdditional = 0;

    if (totalBusinessDaysInYear <= allocatedVacation) {
      spentVacation = totalBusinessDaysInYear;
    } else {
      spentVacation = allocatedVacation;
      spentAdditional = Math.min(totalBusinessDaysInYear - allocatedVacation, allocatedAdditional);
    }
    
    // If totalBusinessDaysInYear exceeds both, it just means they took more days than allocated (system allows this)
    // The calculation above correctly reflects spent days up to the allocated amounts for each category.
    
    return {
      year,
      allocatedVacation,
      allocatedAdditional,
      spentVacation,
      spentAdditional,
      remainingVacation: Math.max(0, allocatedVacation - spentVacation),
      remainingAdditional: Math.max(0, allocatedAdditional - spentAdditional),
      totalApprovedDays: totalBusinessDaysInYear,
    };
  }, [user, requests, holidays, dataLoading]);

  const currentYearStats = useMemo(() => calculateYearStats(currentYear), [calculateYearStats, currentYear]);
  const nextYearStats = useMemo(() => calculateYearStats(nextYear), [calculateYearStats, nextYear]);

  if (dataLoading || !user) {
    return <p>Loading user data...</p>; // Or a more elaborate skeleton
  }

  const StatItem: React.FC<{ label: string; value: number; total?: number; icon?: React.ElementType }> = ({ label, value, total, icon: Icon }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-muted-foreground flex items-center">
          {Icon && <Icon className="mr-2 h-4 w-4 text-primary/80" />}
          {label}
        </span>
        <span className="text-sm font-semibold">{value}{total !== undefined ? ` / ${total}` : ''}</span>
      </div>
      {total !== undefined && total > 0 && (
        <Progress value={(value / total) * 100} className="h-2" />
      )}
       {total !== undefined && total === 0 && value > 0 && (
         <div className="text-xs text-destructive/80 flex items-center mt-1">
            <AlertCircle className="h-3 w-3 mr-1 shrink-0" />
            Days taken exceed allocation (0 days allocated).
         </div>
      )}
    </div>
  );

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
            <StatItem label="Allocated Vacation Days" value={currentYearStats.allocatedVacation} />
            <StatItem label="Spent Vacation Days" value={currentYearStats.spentVacation} total={currentYearStats.allocatedVacation} />
            <StatItem label="Remaining Vacation Days" value={currentYearStats.remainingVacation} />
            <hr className="my-3"/>
            <StatItem label="Allocated Additional Days" value={currentYearStats.allocatedAdditional} icon={CalendarPlus} />
            <StatItem label="Spent Additional Days" value={currentYearStats.spentAdditional} total={currentYearStats.allocatedAdditional} />
            <StatItem label="Remaining Additional Days" value={currentYearStats.remainingAdditional} />
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl">Next Year ({nextYearStats.year})</CardTitle>
            <CardDescription>Your day-off planning for next year.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatItem label="Scheduled Approved Days Off" value={nextYearStats.totalApprovedDays} icon={CalendarCheck}/>
             <hr className="my-3"/>
            <StatItem label="Allocated Vacation Days (Projected)" value={nextYearStats.allocatedVacation} />
            <StatItem label="Spent Vacation Days (Scheduled)" value={nextYearStats.spentVacation} total={nextYearStats.allocatedVacation} />
            <StatItem label="Remaining Vacation Days (Projected)" value={nextYearStats.remainingVacation} />
            <hr className="my-3"/>
            <StatItem label="Allocated Additional Days (Projected)" value={nextYearStats.allocatedAdditional} icon={CalendarPlus}/>
            <StatItem label="Spent Additional Days (Scheduled)" value={nextYearStats.spentAdditional} total={nextYearStats.allocatedAdditional} />
            <StatItem label="Remaining Additional Days (Projected)" value={nextYearStats.remainingAdditional} />
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

