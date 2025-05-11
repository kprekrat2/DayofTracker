
"use client";

import React, { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/hooks/useData";
import type { DayOffRequest, Holiday } from "@/types";
import { addDays, format, getYear, isWithinInterval, startOfYear, endOfYear, max, min as dateMin } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, CalendarClock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => format(new Date(0, i), 'MMMM'));

export function DayOffCalendar() {
  const { user, isLoading: authLoading } = useAuth();
  const { requests, holidays, isLoading: dataLoading } = useData();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const isLoading = authLoading || dataLoading;

  const holidaysForYear = useMemo(() => {
    if (isLoading || !user) return [];
    return holidays.filter(h => getYear(h.date) === selectedYear);
  }, [holidays, selectedYear, isLoading, user]);

  const approvedUserRequestsForYear = useMemo(() => {
    if (isLoading || !user) return [];
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 0, 1));

    return requests.filter(
      (req) => req.userId === user.id && req.status === "approved" &&
               req.endDate >= yearStart && req.startDate <= yearEnd // Check if request interval overlaps with the selected year
    );
  }, [requests, user, selectedYear, isLoading]);

  const modifiers = useMemo(() => {
    if (isLoading) return {};
    const approvedDates: Date[] = [];
    approvedUserRequestsForYear.forEach(req => {
      const yearStartBoundary = startOfYear(new Date(selectedYear, 0, 1));
      const yearEndBoundary = endOfYear(new Date(selectedYear, 11, 31));
      
      // Clamp start and end dates to the selected year
      let currentDay = max([new Date(req.startDate), yearStartBoundary]);
      const lastDay = dateMin([new Date(req.endDate), yearEndBoundary]);

      while (currentDay <= lastDay) {
        approvedDates.push(new Date(currentDay));
        currentDay = addDays(currentDay, 1);
      }
    });

    return {
      holiday: holidaysForYear.map(h => h.date),
      approved: approvedDates,
    };
  }, [holidaysForYear, approvedUserRequestsForYear, selectedYear, isLoading]);

  const modifiersClassNames = {
    holiday: "bg-purple-100 text-purple-700 rounded-md font-semibold border-purple-300 dark:bg-purple-800 dark:text-purple-200 dark:border-purple-600",
    approved: "bg-green-100 text-green-700 rounded-md font-semibold border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600",
    today: "bg-primary/20 text-primary rounded-md border-primary font-bold",
  };

  const DayContent = ({ date, displayMonth }: { date: Date; displayMonth: Date }) => {
    // Only render content if the date is in the displayMonth for this specific calendar instance
    if (date.getMonth() !== displayMonth.getMonth()) {
        return <div className="p-1 text-center text-muted-foreground opacity-50">{format(date, 'd')}</div>;
    }

    const dayHolidays = holidaysForYear.filter(h => format(h.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    const dayApprovedRequests = approvedUserRequestsForYear.filter(r => 
      isWithinInterval(date, { start: r.startDate, end: r.endDate })
    );

    if (dayHolidays.length === 0 && dayApprovedRequests.length === 0) {
      return <div className="p-1 text-center">{format(date, 'd')}</div>;
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative p-1 text-center cursor-pointer h-full w-full flex items-center justify-center">
            {format(date, 'd')}
            {(dayHolidays.length > 0 || dayApprovedRequests.length > 0) && (
              <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-primary"></span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-60 text-sm p-3 space-y-2">
          <p className="font-semibold border-b pb-1 mb-1">{format(date, "MMMM d, yyyy")}</p>
          {dayHolidays.map(h => (
            <div key={h.id} className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Star className="h-4 w-4 shrink-0" /> <span>{h.name} (Holiday)</span>
            </div>
          ))}
          {dayApprovedRequests.map(r => (
            <div key={r.id} className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Briefcase className="h-4 w-4 shrink-0" /> <span>My Day Off</span>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    );
  };
  
  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(event.target.value, 10);
    if (!isNaN(year) && year > 1900 && year < 2200) { 
      setSelectedYear(year);
    }
  };


  if (isLoading) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="shadow-inner">
                <CardHeader className="p-2 sm:p-3">
                  <Skeleton className="h-6 w-24 mx-auto" />
                </CardHeader>
                <CardContent className="p-1 sm:p-2">
                  <Skeleton className="h-52 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
           <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!user) {
     return (
        <Card className="shadow-xl text-center">
            <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Please log in to view the calendar.</p></CardContent>
        </Card>
     );
  }


  return (
    <Card className="shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <CardTitle className="text-2xl">My Time Off - {selectedYear}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedYear(y => y - 1)} aria-label="Previous year">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Input
            type="number"
            value={selectedYear}
            onChange={handleYearChange}
            className="w-28 text-center text-lg font-semibold"
            min="1900"
            max="2200"
            aria-label="Selected year"
          />
          <Button variant="outline" size="icon" onClick={() => setSelectedYear(y => y + 1)} aria-label="Next year">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
          {MONTH_NAMES.map((monthName, monthIndex) => {
            const monthDate = new Date(selectedYear, monthIndex, 1);
            return (
            <div key={monthIndex} className="flex flex-col">
              <h3 className="text-xl font-semibold text-center mb-2 text-primary">{monthName}</h3>
              <Calendar
                month={monthDate}
                defaultMonth={monthDate} // Important for initial render of each month
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className="rounded-md border p-0 shadow-inner bg-muted/30 w-full" // Adjusted padding
                components={{ DayContent: (props) => <DayContent {...props} date={props.date} displayMonth={monthDate}/> }}
                fixedWeeks
                showOutsideDays={true}
                fromMonth={monthDate} // Lock navigation to this month
                toMonth={monthDate}   // Lock navigation to this month
                classNames={{
                    caption_label: "hidden", // Hide default month/year label in caption
                    nav_button: "hidden", // Hide default nav buttons
                    head_cell: "text-xs w-8 h-8 sm:w-9 sm:h-9", // Smaller head cells
                    cell: "w-8 h-8 sm:w-9 sm:h-9", // Smaller day cells
                    day: "text-xs w-8 h-8 sm:w-9 sm:h-9", // Smaller day numbers
                }}
              />
            </div>
          )})}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-sm bg-green-100 border border-green-300 dark:bg-green-800 dark:border-green-600"></span>
            My Approved Day Off
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-sm bg-purple-100 border border-purple-300 dark:bg-purple-800 dark:border-purple-600"></span>
            Company Holiday
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
