// 'use server';

/**
 * @fileOverview AI-powered analysis of day-off request descriptions to suggest potential rejection reasons.
 *
 * - analyzeDayOffRequest - Analyzes the day-off request description and suggests potential rejection reasons.
 * - AnalyzeDayOffRequestInput - The input type for the analyzeDayOffRequest function.
 * - AnalyzeDayOffRequestOutput - The return type for the analyzeDayOffRequest function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDayOffRequestInputSchema = z.object({
  description: z
    .string()
    .describe('The description provided by the employee for the day-off request.'),
});

export type AnalyzeDayOffRequestInput = z.infer<typeof AnalyzeDayOffRequestInputSchema>;

const AnalyzeDayOffRequestOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of potential reasons why the day-off request might be rejected.'),
});

export type AnalyzeDayOffRequestOutput = z.infer<typeof AnalyzeDayOffRequestOutputSchema>;

export async function analyzeDayOffRequest(
  input: AnalyzeDayOffRequestInput
): Promise<AnalyzeDayOffRequestOutput> {
  return analyzeDayOffRequestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dayOffRequestAnalysisPrompt',
  input: {schema: AnalyzeDayOffRequestInputSchema},
  output: {schema: AnalyzeDayOffRequestOutputSchema},
  prompt: `You are an AI assistant that analyzes day-off request descriptions and provides suggestions on potential reasons for rejection.

  Description: {{{description}}}

  Based on the description, provide a list of potential reasons why the day-off request might be rejected.`,
});

const analyzeDayOffRequestFlow = ai.defineFlow(
  {
    name: 'analyzeDayOffRequestFlow',
    inputSchema: AnalyzeDayOffRequestInputSchema,
    outputSchema: AnalyzeDayOffRequestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
