// This is a server-side file, mark it with 'use server'
'use server';

/**
 * @fileOverview Brainstorms ideas based on a given prompt.
 *
 * - brainstormIdeas - A function that takes a prompt and returns brainstormed ideas.
 * - BrainstormIdeasInput - The input type for the brainstormIdeas function.
 * - BrainstormIdeasOutput - The return type for the brainstormIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BrainstormIdeasInputSchema = z.object({
  prompt: z.string().describe('A prompt to generate brainstorm ideas from.'),
});

export type BrainstormIdeasInput = z.infer<typeof BrainstormIdeasInputSchema>;

const BrainstormIdeasOutputSchema = z.object({
  ideas: z.array(z.string()).describe('An array of brainstormed ideas.'),
});

export type BrainstormIdeasOutput = z.infer<typeof BrainstormIdeasOutputSchema>;

export async function brainstormIdeas(input: BrainstormIdeasInput): Promise<BrainstormIdeasOutput> {
  return brainstormIdeasFlow(input);
}

const brainstormIdeasPrompt = ai.definePrompt({
  name: 'brainstormIdeasPrompt',
  input: {schema: BrainstormIdeasInputSchema},
  output: {schema: BrainstormIdeasOutputSchema},
  prompt: `You are a creative brainstorming assistant. Generate a list of creative and novel ideas based on the following prompt:\n\nPrompt: {{{prompt}}}`,
});

const brainstormIdeasFlow = ai.defineFlow(
  {
    name: 'brainstormIdeasFlow',
    inputSchema: BrainstormIdeasInputSchema,
    outputSchema: BrainstormIdeasOutputSchema,
  },
  async input => {
    const {output} = await brainstormIdeasPrompt(input);
    return output!;
  }
);
