
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Send, Sparkles, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { getAIRejectionSuggestions } from "@/app/submit-request/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const 이유_최소_길이 = 10;
const 이유_최대_길이 = 500;

const dayOffRequestFormSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
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
  const { addRequest } = useData();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);

  const form = useForm<DayOffRequestFormValues>({
    resolver: zodResolver(dayOffRequestFormSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleGetAISuggestions = async () => {
    const reason = form.getValues("reason");
    if (reason.length < 이유_최소_길이) {
      toast({
        title: "Reason too short",
        description: `Please provide a reason with at least ${이유_최소_길이} characters to get AI suggestions.`,
        variant: "destructive",
      });
      return;
    }
    setIsAISuggestionLoading(true);
    setAiSuggestions([]);
    startTransition(async () => {
      const result = await getAIRejectionSuggestions({ description: reason });
      if (result.success && result.suggestions) {
        setAiSuggestions(result.suggestions);
        if (result.suggestions.length === 0) {
          toast({ title: "AI Analysis Complete", description: "No specific rejection concerns found by AI."});
        }
      } else {
        toast({
          title: "AI Suggestion Error",
          description: result.error || "Could not fetch AI suggestions.",
          variant: "destructive",
        });
      }
      setIsAISuggestionLoading(false);
    });
  };

  function onSubmit(data: DayOffRequestFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to submit a request.", variant: "destructive" });
      return;
    }

    startTransition(() => {
      try {
        const newRequest = addRequest({ ...data, userId: user.id, aiSuggestions });
        toast({
          title: "Request Submitted!",
          description: `Your day-off request from ${format(data.startDate, "PPP")} to ${format(data.endDate, "PPP")} has been submitted.`,
        });
        form.reset();
        setAiSuggestions([]);
        router.push("/"); // Redirect to the list of requests
      } catch (error) {
        toast({ title: "Submission Failed", description: "Could not submit your request. Please try again.", variant: "destructive"});
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
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
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
                    Your reason will be analyzed by AI for potential rejection flags.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="button" variant="outline" onClick={handleGetAISuggestions} disabled={isAISuggestionLoading || isPending} className="w-full md:w-auto">
              {isAISuggestionLoading ? (
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Get AI Rejection Suggestions
            </Button>

            {aiSuggestions.length > 0 && (
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                 <Sparkles className="h-4 w-4 !text-blue-600" />
                <AlertTitle className="text-blue-700">AI Suggestions</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Based on your reason, here are some potential concerns an AI identified (these are suggestions and may not apply):
                  <ul className="list-disc list-inside mt-2 text-sm">
                    {aiSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
             {isAISuggestionLoading && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    AI is analyzing your reason...
                </div>
            )}

            <Button type="submit" disabled={isPending || isAISuggestionLoading} className="w-full md:w-auto">
              <Send className="mr-2 h-4 w-4" />
              {isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
