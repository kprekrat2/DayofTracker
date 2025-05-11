
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { countBusinessDays, calculateUserYearStats } from "@/lib/dayoff-utils";

const 이유_최소_길이 = 10;
const 이유_최대_길이 = 500;

const dayOffRequestFormSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
  requestType: z.enum(["vacation", "additional"], {
    required_error: "Request type is required.",
  }),
  reason: z.string()
    .min(이유_최소_길이, { message: `Reason must be at least ${이유_최소_길이} characters.`})
    .max(이유_최대_길이, { message: `Reason must not exceed ${이유_최대_길이} characters.`}),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});

type DayOffRequestFormValues = z.infer<typeof dayOffRequestFormSchema>;

export function DayOffRequestForm() {
  const { user } = useAuth();
  const { addRequest, holidays, requests: allRequests } = useData(); // Get holidays and allRequests
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<DayOffRequestFormValues>({
    resolver: zodResolver(dayOffRequestFormSchema),
    defaultValues: {
      reason: "",
      // requestType: "vacation", // Optionally set a default
    },
  });

  function onSubmit(data: DayOffRequestFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to submit a request.", variant: "destructive" });
      return;
    }

    const requestedBusinessDays = countBusinessDays(data.startDate, data.endDate, holidays);

    if (requestedBusinessDays > 0) {
      const yearOfRequestStart = data.startDate.getFullYear();
      // Filter requests for the current user to pass to calculateUserYearStats
      const currentUserRequests = allRequests.filter(r => r.userId === user.id);
      const statsForYearOfRequestStart = calculateUserYearStats(yearOfRequestStart, user, currentUserRequests, holidays);

      if (data.requestType === "vacation") {
        if (requestedBusinessDays > statsForYearOfRequestStart.remainingVacation) {
          toast({
            title: "Insufficient Vacation Days",
            description: `You have ${statsForYearOfRequestStart.remainingVacation} vacation day(s) available for ${yearOfRequestStart}, but this request requires ${requestedBusinessDays} business day(s).`,
            variant: "destructive",
            duration: 5000,
          });
          return;
        }
      } else if (data.requestType === "additional") {
        if (requestedBusinessDays > statsForYearOfRequestStart.remainingAdditional) {
          toast({
            title: "Insufficient Additional Days",
            description: `You have ${statsForYearOfRequestStart.remainingAdditional} additional day(s) available for ${yearOfRequestStart}, but this request requires ${requestedBusinessDays} business day(s).`,
            variant: "destructive",
            duration: 5000,
          });
          return;
        }
      }
    } else if (data.startDate <= data.endDate) { // if requestedBusinessDays is 0 or less, but dates are valid
        toast({
            title: "No working days selected",
            description: "Your request does not include any working days. No leave will be deducted if approved.",
            variant: "default",
            duration: 5000,
        });
        // Allow submission for record keeping or if policy allows
    }


    startTransition(() => {
      try {
        const newRequest = addRequest({ 
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason,
            requestType: data.requestType, 
            userId: user.id 
        });
        toast({
          title: "Request Submitted!",
          description: `Your day-off request from ${format(data.startDate, "PPP")} to ${format(data.endDate, "PPP")} has been submitted.`,
        });
        form.reset();
        router.push("/"); 
      } catch (error) {
        toast({ title: "Submission Failed", description: (error as Error)?.message || "Could not submit your request. Please try again.", variant: "destructive"});
      }
    });
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Submit Day-Off Request</CardTitle>
        <CardDescription>Fill in the details below to request time off.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } 
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < (form.getValues("startDate") || new Date(new Date().setHours(0,0,0,0)))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the type of day off" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vacation">Vacation Day</SelectItem>
                      <SelectItem value="additional">Additional Day (e.g., special leave)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose if this is a standard vacation day or an additional day off.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Absence</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a brief reason for your time off (e.g., vacation, personal appointment, family event)."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide a clear and concise reason for your absence.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full md:w-auto">
              <Send className="mr-2 h-4 w-4" />
              {isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
