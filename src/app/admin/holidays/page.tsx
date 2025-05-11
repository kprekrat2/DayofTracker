"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addYears, format, getYear } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2, VenetianMask } from "lucide-react";
import type { Holiday } from "@/types";
import Image from "next/image";

const holidayFormSchema = z.object({
  name: z.string().min(3, { message: "Holiday name must be at least 3 characters." }).max(100, { message: "Holiday name must not exceed 100 characters." }),
  date: z.date({ required_error: "Holiday date is required." }),
});

type HolidayFormValues = z.infer<typeof holidayFormSchema>;

export default function AdminHolidaysPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { holidays, addHoliday, deleteHoliday, isLoading: dataLoading } = useData();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const holidayForm = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      name: "",
      date: new Date(selectedYear, 0, 1), 
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login'); // Redirect to login if not admin
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    holidayForm.reset({ name: "", date: new Date(selectedYear, 0, 1) });
  }, [selectedYear, holidayForm]);


  const holidaysForYear = useMemo(() => {
    return holidays.filter(h => getYear(h.date) === selectedYear)
                   .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [holidays, selectedYear]);

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(event.target.value, 10);
    if (!isNaN(year) && year > 1900 && year < 2200) { 
      setSelectedYear(year);
    }
  };

  const onSubmitHoliday = (data: HolidayFormValues) => {
    if (getYear(data.date) !== selectedYear) {
        toast({
            title: "Invalid Date",
            description: `Public holiday date must be within the year ${selectedYear}.`,
            variant: "destructive",
        });
        holidayForm.setValue("date", new Date(selectedYear, data.date.getMonth(), data.date.getDate()));
        return;
    }

    startTransition(() => {
      try {
        addHoliday(data);
        toast({
          title: "Public Holiday Added",
          description: `${data.name} on ${format(data.date, "PPP")} has been added.`,
        });
        holidayForm.reset({ name: "", date: new Date(selectedYear, 0, 1) });
      } catch (error) {
        toast({ title: "Failed to Add Public Holiday", description: "Could not add the public holiday. Please try again.", variant: "destructive" });
      }
    });
  };

  const handleDeleteHoliday = (holidayId: string, holidayName: string) => {
    startTransition(() => {
      try {
        deleteHoliday(holidayId);
        toast({
          title: "Public Holiday Deleted",
          description: `${holidayName} has been deleted.`,
          variant: "destructive"
        });
      } catch (error) {
        toast({ title: "Failed to Delete Public Holiday", description: "Could not delete the public holiday. Please try again.", variant: "destructive" });
      }
    });
  };

  if (authLoading || dataLoading || !user || user.role !== 'admin') {
    return (
      <div className="space-y-8">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-1/4" /> 
            <Skeleton className="h-40 w-full rounded-lg" /> 
            <Skeleton className="h-32 w-full rounded-lg" /> 
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <VenetianMask className="h-7 w-7 text-primary" /> Manage Company Public Holidays
          </CardTitle>
          <CardDescription>
            Define and manage company-wide public holidays on a yearly basis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <Label htmlFor="year-select" className="text-lg font-semibold">Select Year:</Label>
            <Input
              id="year-select"
              type="number"
              value={selectedYear}
              onChange={handleYearChange}
              className="mt-2 w-32 text-base"
              min="1900"
              max="2200"
            />
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Add New Public Holiday for {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...holidayForm}>
                <form onSubmit={holidayForm.handleSubmit(onSubmitHoliday)} className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4 items-end">
                    <FormField
                      control={holidayForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Public Holiday Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Spring Festival" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={holidayForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Public Holiday Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) field.onChange(date);
                                }}
                                disabled={(date) => getYear(date) !== selectedYear} 
                                initialFocus
                                month={new Date(selectedYear, field.value ? field.value.getMonth() : 0, 1)} 
                                defaultMonth={new Date(selectedYear, 0, 1)} 
                                fromYear={selectedYear}
                                toYear={selectedYear}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={isPending}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isPending ? "Adding..." : "Add Public Holiday"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Public Holidays in {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              {holidaysForYear.length === 0 ? (
                 <div className="text-center py-10">
                  <Image 
                    src="https://picsum.photos/seed/no-public-holidays/300/200" 
                    alt="No public holidays defined" 
                    width={250} 
                    height={160} 
                    className="mx-auto mb-4 rounded-lg shadow-sm"
                    data-ai-hint="empty calendar"
                  />
                  <p className="text-muted-foreground">No public holidays defined for {selectedYear}.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {holidaysForYear.filter(Boolean).map((holiday) => (
                    <li key={holiday.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <div>
                        <p className="font-semibold">{holiday.name}</p>
                        <p className="text-sm text-muted-foreground">{format(holiday.date, "MMMM d, yyyy (EEEE)")}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHoliday(holiday.id, holiday.name)}
                        disabled={isPending}
                        aria-label={`Delete ${holiday.name}`}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

