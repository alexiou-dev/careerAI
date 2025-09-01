'use server';

/**
 * @fileOverview This file defines a function for finding relevant job postings based on user input
 * by calling the Adzuna API directly.
 *
 * - findRelevantJobPostings - A function that orchestrates the job search process.
 * - FindRelevantJobPostingsInput - The input type for the findRelevantJobPostings function.
 * - FindRelevantJobPostingsOutput - The return type for the findRelevantJobPostings function.
 */

import {z} from 'zod';

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
  jobPostings: z.array(JobPostingSchema).describe('A list of job postings from Adzuna.'),
});
export type FindRelevantJobPostingsOutput = z.infer<typeof FindRelevantJobPostingsOutputSchema>;
export type JobPosting = z.infer<typeof JobPostingSchema>;

export async function findRelevantJobPostings(
  input: FindRelevantJobPostingsInput
): Promise<FindRelevantJobPostingsOutput> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  console.log('Attempting to find jobs with input:', input);

  if (!appId || !appKey) {
    console.error('Adzuna API credentials are not set in the environment variables.');
    return { jobPostings: [] };
  }
  
  console.log('Adzuna App ID found, proceeding with API call.');

  const page = Math.floor(Math.random() * 5) + 1; // Get a random page from 1 to 5
  const what = encodeURIComponent(`${input.jobRole} ${input.preferences || ''}`);
  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/${page}?app_id=${appId}&app_key=${appKey}&what=${what}&results_per_page=20&content-type=application/json`;



  console.log('Fetching from URL:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Adzuna API request failed with status: ${response.status}`, errorBody);
      return { jobPostings: [] };
    }

    const data = await response.json();
    
    // Log what we received from Adzuna for debugging
    console.log('Received data from Adzuna:', JSON.stringify(data, null, 2));

    const jobs: JobPosting[] = (data.results || []).map((job: any) => ({
      title: `${job.title} at ${job.company?.display_name || 'Unknown'}`,
      url: job.redirect_url,
    }));
    
    console.log(`Successfully mapped ${jobs.length} jobs.`);
    return { jobPostings: jobs };

  } catch (error) {
    console.error('An unexpected error occurred while fetching from Adzuna:', error);
    return { jobPostings: [] };
  }
}
