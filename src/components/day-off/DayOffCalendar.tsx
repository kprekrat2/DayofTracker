
"use client";

import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/hooks/useData";
import type { DayOffRequest, Holiday } from "@/types";
import { addDays, format, isWithinInterval } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Briefcase, CalendarClock, Star } from 'lucide-react';

export function DayOffCalendar() {
  const { user, isLoading: authLoading } = useAuth();
  const { requests, holidays, isLoading: dataLoading } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (authLoading || dataLoading) {
    return <Card><CardContent className="p-6"><div className="h-[400px] w-full bg-muted animate-pulse rounded-md" /></CardContent></Card>;
  }

  if (!user) {
    return <p className="text-center text-muted-foreground">Please log in to view the calendar.</p>;
  }

  const approvedUserRequests = requests.filter(
    (req) => req.userId === user.id && req.status === "approved"
  );

  const modifiers = {
    holiday: holidays.map(h => h.date),
    approved: approvedUserRequests.reduce((acc, req) => {
      let day = new Date(req.startDate);
      // Ensure we iterate correctly even if start and end are the same day
      const endDate = new Date(req.endDate);
      while (day <= endDate) {
        acc.push(new Date(day)); // Push a new Date object to avoid mutation issues
        day = addDays(day, 1);
      }
      return acc;
    }, [] as Date[]),
  };

  const modifiersClassNames = {
    holiday: "bg-purple-100 text-purple-700 rounded-md font-semibold border-purple-300 dark:bg-purple-800 dark:text-purple-200 dark:border-purple-600",
    approved: "bg-green-100 text-green-700 rounded-md font-semibold border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600",
    today: "bg-primary/20 text-primary rounded-md border-primary font-bold",
  };
  
  const DayContent = (props: { date: Date; displayMonth: Date }) => {
    const date = props.date;
    const dayHolidays = holidays.filter(h => format(h.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    const dayApprovedRequests = approvedUserRequests.filter(r => 
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


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">My Time Off Calendar</CardTitle>
        <CardDescription>
          View your approved day-offs and company holidays.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          selected={undefined} // No single date selection needed for this view
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          className="rounded-md border p-4 shadow-inner bg-muted/20 w-full max-w-md"
          components={{
            DayContent: DayContent
          }}
        />
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
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
