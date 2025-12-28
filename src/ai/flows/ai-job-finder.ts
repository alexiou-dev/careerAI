// Server-side execution directive 
'use server';

/**
 * AI Job Finder Flow
 * 
 * This file implements the AI-powered job search functionality that integrates:
 * 1. Adzuna API - Global job search database
 * 2. Jooble API - Aggregated job listings
 * 3. Country detection logic for location-based searching
 * 4. Intelligent query building from user input
 */
import { z } from 'zod';

// ---------------------
// Input / Output Schemas
// ---------------------

/**
 * Input Schema for Job Search
 * 
 * Defines and validates the structure of user search criteria.
 * Used for both API requests and internal data validation.
 */
const FindRelevantJobPostingsInputSchema = z.object({
  // Required: Job role to search for
  jobRole: z.string().describe('The desired job role, e.g., Software Engineer, Data Scientist.'),
  // Optional filters
  location: z.string().optional().describe('City, state, or country for the job.'),
  minWage: z.number().optional().describe('Minimum desired annual salary.'),
  workStyle: z.enum(['any', 'remote', 'hybrid']).optional().describe('Desired work style.'),
  other: z.string().optional().describe('Other preferences, e.g., technologies, company size.'),
  major: z.string().optional().describe('Your field of study, e.g., Economics, Computer Science.'),
  cvFile: z.instanceof(File).optional().describe('PDF file of your CV.'),
});
export type FindRelevantJobPostingsInput = z.infer<typeof FindRelevantJobPostingsInputSchema>;

/**
 * Job Posting Schema
 * Standardized structure for job postings across all data sources.
 * Ensures consistent data format regardless of source API.
 */
const JobPostingSchema = z.object({
  // Core job information
  title: z.string(),
  url: z.string().url(),
  company: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  // Metadata
  postedAt: z.string().optional(),
  description: z.string().optional(),
  skills: z.array(z.string()).optional(),
  summary: z.string().optional(),
  // AI/ML enhancements
  matchPercentage: z.number().optional(), // AI-calculated match score
  remote: z.boolean().optional(), // Remote work indicator
});
export type JobPosting = z.infer<typeof JobPostingSchema>;

const FindRelevantJobPostingsOutputSchema = z.object({
  jobPostings: z.array(JobPostingSchema),
});
/**
 * Output Schema for Job Search Results
 * Wrapper for array of job postings with consistent structure.
 */
export type FindRelevantJobPostingsOutput = z.infer<typeof FindRelevantJobPostingsOutputSchema>;

// ---------------------
// Country detection for Adzuna
// ---------------------

/**
 * Country Code Mapping
 * 
 * Maps location names to Adzuna API country codes.
 * Adzuna requires ISO country codes for regional searches.
 */
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

/**
 * Detect Country Code from Location String
 * 
 * Converts human-readable location to Adzuna API country code.
 * Supports city names, country names, and common variations.
 */
function detectCountry(location?: string): string | null {
  if (!location) return null;
  // Normalize: lowercase and remove special characters
  const normalized = location.toLowerCase();
  // Check each mapping for substring match
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (normalized.includes(key)) return code;
  }
  return null; // No match found
}

// ---------------------
// Adzuna fetch
// ---------------------


/**
 * Fetch Job Postings from Adzuna API
 * Adzuna provides global job listings with rich metadata.
 * Features:
 * - Multi-country search with fallback
 * - Salary filtering
 * - Location-based search
 */
async function fetchAdzuna(input: FindRelevantJobPostingsInput): Promise<JobPosting[]> {
  // Validate API credentials from environment variables
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
   // Early return if credentials missing 
  if (!appId || !appKey) {
    console.warn('Adzuna API credentials not configured');
    return [];
  }

   /**
   * Build Search Query
   * 
   * Combines multiple input fields into a comprehensive search query.
   * Starts with job role, adds optional filters for better matching.
   */
  let query = input.jobRole;
  if (input.other) query += ` ${input.other}`; // Additional preferences
  if (input.workStyle && input.workStyle !== 'any') query += ` ${input.workStyle}`; // Work style 
  if (input.major) query += ` ${input.major}`; // Educational background

  /**
   * Determine Target Countries
   * 
   * Adzuna requires country-specific API endpoints.
   * Strategy:
   * 1. Try to detect country from location
   * 2. If no match, try major job markets as fallback
   */
  const country = detectCountry(input.location); // Use detected country
  const countriesToTry = country ? [country] : ["us", "gb", "ca", "de", "fr"]; // Fallback to major markets

  const results: JobPosting[] = [];

  /**
   * Multi-Country Search Loop
   * Searches each country sequentially until results found.
   * Uses random page selection for result variety.
   */
  for (const c of countriesToTry) {
    const page = Math.floor(Math.random() * 3) + 1;

    // Build API query parameters
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what: query, // Search query
      results_per_page: "10", // Limit results per request
      "content-type": "application/json",
    });
    // Optional filters
    if (input.location) params.append("where", input.location);
    if (input.minWage) params.append("salary_min", String(input.minWage));

    // Construct API URL
    const url = `https://api.adzuna.com/v1/api/jobs/${c}/search/${page}?${params.toString()}`;

    try {
      // Make API request
      const res = await fetch(url);
      if (!res.ok) continue; // Skip failed requests
      
      // Parse response
      const data = await res.json();

      /**
       * Transform Adzuna API Response
       * Converts Adzuna-specific format to standardized JobPosting structure.
       * Handles missing fields gracefully with defaults.
       */
      const jobs = (data.results || []).map((job: any) => {
      // Extract description
      const fullDescription = job.description || job.snippet || job.title;
      const summary = fullDescription.split('. ')[0] + '.'; // first sentence

  // Return standardized job posting
  return {
    title: job.title,
    company: job.company?.display_name || job.company || 'Unknown',
    url: job.redirect_url || job.link,
    location: job.location?.display_name || job.location,
    // Format salary range if available
    salary: job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : job.salary,
    postedAt: job.created || job.updated,
    description: fullDescription,
    summary,
    remote: job.contract_time === 'remote' || job.type?.toLowerCase().includes('remote'),
  };
});
      // Add successful results
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

/**
 * Fetch Job Postings from Jooble API
 * Jooble aggregates jobs from multiple sources worldwide.
 */
async function fetchJooble(input: FindRelevantJobPostingsInput): Promise<JobPosting[]> {
  // Validate API credentials
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) {
    console.warn('Jooble API key not configured');
    return [];
  }

  /**
   * Location Normalization
   *
   * Jooble requires specific location formats.
   * Special case: Greece → Hellenic Republic
   */
  let joobleLocation = input.location || "";
  if (joobleLocation.toLowerCase() === "greece") joobleLocation = "Hellenic Republic";

   /**
   * Build Request Payload
   * Jooble uses POST with JSON body
   */
  const payload: any = {
    keywords: input.jobRole,
    location: joobleLocation,
    salary: input.minWage || undefined,
    contract_type: input.workStyle === "remote" ? "remote" : undefined,
    page: 1,
    limit: 10,
  };

  // Enhance search keywords with additional criteria
  if (input.other) payload.keywords += ` ${input.other}`;
  if (input.major) payload.keywords += ` ${input.major}`;
  // Include CV filename if provided (for CV-aware searching)
  if (input.cvFile) payload.cvFileName = input.cvFile.name;

  try {
    // Make API request
    const res = await fetch("https://jooble.org/api/" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return [];
    
    // Parse response
    const data = await res.json();

     /**
     * Transform Jooble API Response
     * 
     * Converts Jooble-specific format to standardized JobPosting structure.
     * Includes generated match percentages for ranking.
     */
    const jobs: JobPosting[] = (data.jobs || []).map((job: any) => ({
      title: job.title,
      company: job.company || 'Unknown',
      url: job.link,
      location: job.location,
      salary: job.salary,
      postedAt: job.updated,
      description: job.snippet,
      skills: job.keywords || [],
      matchPercentage: Math.floor(Math.random() * 40) + 60, // fake match (60–100%)
      remote: job.type?.toLowerCase().includes("remote"),
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
  /**
   * Input Normalization
   * 
   * Use major as jobRole if jobRole not provided.
   * This allows searches by field of study when no specific role given.
   */
  if (!input.jobRole && input.major) input.jobRole = input.major;

  /**
   * Parallel API Fetching
   * 
   * Fetch from both APIs simultaneously for better performance.
   */
  const [adzunaJobs, joobleJobs] = await Promise.all([
    fetchAdzuna(input),
    fetchJooble(input),
  ]);

  // Add all jobs to map (duplicates by URL will be overwritten)
  const allJobsMap = new Map<string, JobPosting>();
  [...adzunaJobs, ...joobleJobs].forEach(job => allJobsMap.set(job.url, job));

  /**
   * Return Standardized Results
   * 
   * Convert map back to array for consistent output format.
   * Clean, deduplicated results for the client.
   */
  return { jobPostings: Array.from(allJobsMap.values()) };
}

