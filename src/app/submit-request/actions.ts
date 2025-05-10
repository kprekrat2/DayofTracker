
"use server";

import { analyzeDayOffRequest, AnalyzeDayOffRequestInput } from "@/ai/flows/dayoff-request-analyzer";

export async function getAIRejectionSuggestions(input: AnalyzeDayOffRequestInput) {
  try {
    const result = await analyzeDayOffRequest(input);
    return { success: true, suggestions: result.suggestions };
  } catch (error) {
    console.error("Error analyzing day-off request:", error);
    return { success: false, error: "Failed to get AI suggestions." };
  }
}
