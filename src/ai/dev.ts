import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-meeting-minutes.ts';
import '@/ai/flows/brainstorm-ideas.ts';
import '@/ai/flows/assign-responsibilities.ts';