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
  minutes: z.string().describe('Las actas de la reunión a resumir.'),
});

export type SummarizeMeetingMinutesInput = z.infer<
  typeof SummarizeMeetingMinutesInputSchema
>;

const SummarizeMeetingMinutesOutputSchema = z.object({
  summary: z.string().describe('Un resumen de las actas de la reunión.'),
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
  prompt: `Eres un asistente de IA que ayuda a resumir las actas de las reuniones.

  Proporcione un resumen conciso de las decisiones clave y los puntos de acción de las siguientes actas de la reunión:

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
