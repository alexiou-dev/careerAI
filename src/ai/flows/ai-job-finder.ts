'use server';

/**
 * @fileOverview This file defines a Genkit flow for finding relevant job postings based on user input.
 *
 * - findRelevantJobPostings - A function that orchestrates the job search process.
 * - FindRelevantJobPostingsInput - The input type for the findRelevantJobPostings function.
 * - FindRelevantJobPostingsOutput - The return type for the findRelevantJobPostings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindRelevantJobPostingsInputSchema = z.object({
  jobRole: z.string().describe('The desired job role, e.g., Software Engineer, Data Scientist.'),
  preferences: z
    .string()
    .optional()
    .describe('Any specific preferences for the job, such as location, salary, or company size.'),
});
export type FindRelevantJobPostingsInput = z.infer<typeof FindRelevantJobPostingsInputSchema>;

const JobPostingSchema = z.object({
  title: z.string().describe('The job title and company, e.g., "Software Engineer at Google".'),
  url: z.string().url().describe('The direct URL to the job posting.'),
});

const FindRelevantJobPostingsOutputSchema = z.object({
  jobPostings: z
    .array(JobPostingSchema)
    .describe('A list of job postings curated from the web, based on the input.'),
});
export type FindRelevantJobPostingsOutput = z.infer<typeof FindRelevantJobPostingsOutputSchema>;
export type JobPosting = z.infer<typeof JobPostingSchema>;

export async function findRelevantJobPostings(
  input: FindRelevantJobPostingsInput
): Promise<FindRelevantJobPostingsOutput> {
  return findRelevantJobPostingsFlow(input);
}

const findJobsPrompt = ai.definePrompt({
  name: 'findJobsPrompt',
  input: {schema: FindRelevantJobPostingsInputSchema},
  output: {schema: FindRelevantJobPostingsOutputSchema},
  prompt: `You are an expert AI job search assistant. Your task is to find currently available job postings from the web.

Job Role: {{{jobRole}}}
Preferences: {{{preferences}}}

VERY IMPORTANT INSTRUCTIONS:
1.  **RECENCY IS CRITICAL**: Only include jobs posted within the **LAST 7 DAYS**. Do not include older jobs under any circumstances.
2.  **VERIFY ALL LINKS**: You MUST verify that every single link you provide is currently active and leads directly to the job application page. Do not provide links to expired, closed, or "no longer available" positions.
3.  **SEARCH FRESH**: Perform a new search every time. Do not use cached or old results.
4.  Return a list of relevant job postings. If you cannot find any recent, active jobs, return an empty list.`,
});

const findRelevantJobPostingsFlow = ai.defineFlow(
  {
    name: 'findRelevantJobPostingsFlow',
    inputSchema: FindRelevantJobPostingsInputSchema,
    outputSchema: FindRelevantJobPostingsOutputSchema,
  },
  async input => {
    const {output} = await findJobsPrompt(input);
    return output!;
  }
);
