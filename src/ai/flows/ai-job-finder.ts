'use server';

import { z } from 'zod';

const FindRelevantJobPostingsInputSchema = z.object({
  jobRole: z.string().describe('The desired job role, e.g., Software Engineer, Data Scientist.'),
  location: z.string().optional().describe('City, state, or country for the job.'),
  minWage: z.number().optional().describe('Minimum desired annual salary.'),
  workStyle: z.enum(['any', 'remote', 'hybrid']).optional().describe('Desired work style.'),
  other: z.string().optional().describe('Other preferences, e.g., technologies, company size.'),
});
export type FindRelevantJobPostingsInput = z.infer<typeof FindRelevantJobPostingsInputSchema>;

const JobPostingSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});

const FindRelevantJobPostingsOutputSchema = z.object({
  jobPostings: z.array(JobPostingSchema),
});
export type FindRelevantJobPostingsOutput = z.infer<typeof FindRelevantJobPostingsOutputSchema>;
export type JobPosting = z.infer<typeof JobPostingSchema>;

export async function findRelevantJobPostings(
  input: FindRelevantJobPostingsInput
): Promise<FindRelevantJobPostingsOutput> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) return { jobPostings: [] };

  const page = Math.floor(Math.random() * 5) + 1;

  // Build search query combining role, location, other, and workStyle
  let query = input.jobRole;
  if (input.location) query += ` ${input.location}`;
  if (input.other) query += ` ${input.other}`;
  if (input.workStyle && input.workStyle !== 'any') query += ` ${input.workStyle}`;

  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/${page}?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(
    query
  )}&results_per_page=20&content-type=application/json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return { jobPostings: [] };

    const data = await response.json();

    const jobs: JobPosting[] = (data.results || []).map((job: any) => ({
      title: `${job.title} at ${job.company?.display_name || 'Unknown'}`,
      url: job.redirect_url,
    }));

    return { jobPostings: jobs };
  } catch {
    return { jobPostings: [] };
  }
}
