'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ------------------ Schemas ------------------
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
  jobPostings: z.array(JobPostingSchema),
});
export type FindRelevantJobPostingsOutput = z.infer<typeof FindRelevantJobPostingsOutputSchema>;
export type JobPosting = z.infer<typeof JobPostingSchema>;

// ------------------ Prompt ------------------
const findJobsPrompt = ai.definePrompt({
  name: 'findJobsPrompt',
  input: {
    schema: z.object({
      userInput: FindRelevantJobPostingsInputSchema,
      jobs: z.array(JobPostingSchema),
    }),
  },
  output: { schema: FindRelevantJobPostingsOutputSchema },
  prompt: `You are an AI assistant helping the user find relevant job postings.

User query:
Role: {{{userInput.jobRole}}}
Preferences: {{{userInput.preferences}}}

Candidate jobs:
{{#each jobs}}
- {{title}} ({{url}})
{{/each}}

Instructions:
1. Filter the jobs so only those relevant to the user remain.
2. Prefer jobs that match the user's preferences (e.g., location, role).
3. Return only valid URLs given above, do not make up new ones.
4. Return an empty list if none match.`,
});

// ------------------ Flow ------------------
export async function findRelevantJobPostings(
  input: FindRelevantJobPostingsInput
): Promise<FindRelevantJobPostingsOutput> {
  // Fetch from Adzuna
  const apiUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&what=${encodeURIComponent(input.jobRole)}&where=${encodeURIComponent(input.preferences ?? '')}&max_days_old=7`;
  
  const res = await fetch(apiUrl);
  const data = await res.json();

  const jobs = (data.results || []).map((job: any) => ({
    title: `${job.title} at ${job.company?.display_name ?? 'Unknown'}`,
    url: job.redirect_url,
  }));

  // Pass jobs + user input to AI for filtering
  const { output } = await findJobsPrompt({ userInput: input, jobs });
  return output!;
}
