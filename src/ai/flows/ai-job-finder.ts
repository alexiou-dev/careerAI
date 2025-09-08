'use server';

import { z } from 'zod';

// ---------------------
// Input / Output Schemas
// ---------------------
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
export type JobPosting = z.infer<typeof JobPostingSchema>;

const FindRelevantJobPostingsOutputSchema = z.object({
  jobPostings: z.array(JobPostingSchema),
});
export type FindRelevantJobPostingsOutput = z.infer<typeof FindRelevantJobPostingsOutputSchema>;

// ---------------------
// Country detection for Adzuna
// ---------------------
const COUNTRY_MAP: Record<string, string> = {
  "united states": "us", "usa": "us", "america": "us", "new york": "us", "california": "us", "chicago": "us", "los angeles": "us", "la": "us",
  "canada": "ca", "toronto": "ca", "vancouver": "ca",
  "united kingdom": "gb", "uk": "gb", "england": "gb", "scotland": "gb", "wales": "gb", "london": "gb",
  "ireland": "ie", "dublin": "ie",
  "germany": "de", "berlin": "de", "munich": "de",
  "france": "fr", "paris": "fr",
  "spain": "es", "madrid": "es", "barcelona": "es",
  "italy": "it", "rome": "it", "milan": "it",
  "netherlands": "nl", "amsterdam": "nl",
  "australia": "au", "sydney": "au", "melbourne": "au",
  "india": "in", "delhi": "in", "bangalore": "in",
  "brazil": "br", "rio": "br", "sao paulo": "br",
  "south africa": "za", "cape town": "za", "johannesburg": "za",
};

function detectCountry(location?: string): string | null {
  if (!location) return null;
  const normalized = location.toLowerCase();
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (normalized.includes(key)) return code;
  }
  return null;
}

// ---------------------
// Adzuna fetch
// ---------------------
async function fetchAdzuna(input: FindRelevantJobPostingsInput): Promise<JobPosting[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  let query = input.jobRole;
  if (input.other) query += ` ${input.other}`;
  if (input.workStyle && input.workStyle !== 'any') query += ` ${input.workStyle}`;

  const country = detectCountry(input.location);
  const countriesToTry = country ? [country] : ["us", "gb", "ca", "de", "fr"];

  const results: JobPosting[] = [];

  for (const c of countriesToTry) {
    const page = Math.floor(Math.random() * 3) + 1;

    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what: query,
      results_per_page: "10",
      "content-type": "application/json",
    });
    if (input.location) params.append("where", input.location);
    if (input.minWage) params.append("salary_min", String(input.minWage));

    const url = `https://api.adzuna.com/v1/api/jobs/${c}/search/${page}?${params.toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const jobs = (data.results || []).map((job: any) => ({
        title: `${job.title} at ${job.company?.display_name || 'Unknown'}`,
        url: job.redirect_url,
      }));
      results.push(...jobs);
    } catch {
      continue;
    }
  }

  return results;
}

// ---------------------
// Jooble fetch
// ---------------------
async function fetchJooble(input: FindRelevantJobPostingsInput): Promise<JobPosting[]> {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) return [];

  const payload: any = {
    keywords: input.jobRole,
    location: input.location || "",
    salary: input.minWage || undefined,
    contract_type: input.workStyle === "remote" ? "remote" : undefined,
    page: 1,
    limit: 10,
  };

  if (input.other) payload.keywords += ` ${input.other}`;

  try {
    const res = await fetch("https://jooble.org/api/" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const jobs: JobPosting[] = (data.jobs || []).map((job: any) => ({
      title: `${job.title} at ${job.company || 'Unknown'}`,
      url: job.link,
    }));
    return jobs;
  } catch {
    return [];
  }
}

// ---------------------
// Main function: merge both APIs
// ---------------------
export async function findRelevantJobPostings(
  input: FindRelevantJobPostingsInput
): Promise<FindRelevantJobPostingsOutput> {
  const [adzunaJobs, joobleJobs] = await Promise.all([
    fetchAdzuna(input),
    fetchJooble(input),
  ]);

  // Remove duplicates by URL
  const allJobsMap = new Map<string, JobPosting>();
  [...adzunaJobs, ...joobleJobs].forEach(job => allJobsMap.set(job.url, job));

  return { jobPostings: Array.from(allJobsMap.values()) };
}
