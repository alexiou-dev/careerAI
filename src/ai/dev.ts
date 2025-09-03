import { config } from 'dotenv';
config();
// This is the Genkit development entrypoint.
// It is used to load the flows and tools when running the Genkit CLI.
// e.g. `genkit start -- tsx -r dotenv/config src/ai/dev.ts`

import '@/ai/flows/ai-job-finder.ts';
import '@/ai/flows/tailor-resume.ts';
import '@/ai/flows/generate-document.ts';
import '@/ai/flows/interview-prep.ts';
import '@/ai/flows/analyze-skills.ts';
