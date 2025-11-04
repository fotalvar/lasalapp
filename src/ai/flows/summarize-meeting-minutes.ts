'use server';

/**
 * @fileOverview Summarizes meeting minutes to extract key decisions and action items.
 *
 * - summarizeMeetingMinutes - A function that summarizes meeting minutes.
 * - SummarizeMeetingMinutesInput - The input type for the summarizeMeetingMinutes function.
 * - SummarizeMeetingMinutesOutput - The return type for the summarizeMeetingMinutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMeetingMinutesInputSchema = z.object({
  minutes: z.string().describe('The meeting minutes to summarize.'),
});

export type SummarizeMeetingMinutesInput = z.infer<
  typeof SummarizeMeetingMinutesInputSchema
>;

const SummarizeMeetingMinutesOutputSchema = z.object({
  summary: z.string().describe('A summary of the meeting minutes.'),
});

export type SummarizeMeetingMinutesOutput = z.infer<
  typeof SummarizeMeetingMinutesOutputSchema
>;

export async function summarizeMeetingMinutes(
  input: SummarizeMeetingMinutesInput
): Promise<SummarizeMeetingMinutesOutput> {
  return summarizeMeetingMinutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMeetingMinutesPrompt',
  input: {schema: SummarizeMeetingMinutesInputSchema},
  output: {schema: SummarizeMeetingMinutesOutputSchema},
  prompt: `You are an AI assistant helping to summarize meeting minutes.

  Please provide a concise summary of the key decisions and action items from the following meeting minutes:

  {{minutes}}
  `,
});

const summarizeMeetingMinutesFlow = ai.defineFlow(
  {
    name: 'summarizeMeetingMinutesFlow',
    inputSchema: SummarizeMeetingMinutesInputSchema,
    outputSchema: SummarizeMeetingMinutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
