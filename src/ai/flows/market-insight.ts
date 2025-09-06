'use server';

/**
 * @fileOverview This file defines functions for fetching job market insights from the Adzuna API.
 */
import { z } from 'zod';
import {
  MarketInsightsFormSchema,
  SalaryHistogramResponseSchema,
  TopCompaniesResponseSchema,
  RegionalInsightsResponseSchema,
} from '@/types/ai-market-insights';

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const COUNTRY_CODE = 'gb'; // Using Great Britain as the default

async function fetchAdzunaAPI(
  endpoint: string,
  params: Record<string, string>
) {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error(
      'Adzuna API credentials are not set in the environment variables.'
    );
  }

  const queryParams = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    ...params,
  });

  const url = `https://api.adzuna.com/v1/api/jobs/${COUNTRY_CODE}/${endpoint}?${queryParams.toString()}`;
  console.log('Fetching from Adzuna:', url);

  const response = await fetch(url);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `Adzuna API request failed for ${endpoint} with status: ${response.status}`,
      errorBody
    );
    throw new Error(`Adzuna API request failed for ${endpoint}`);
  }

  return response.json();
}

/**
 * Fetches salary histogram data for a given job role and location.
 */
export async function getSalaryHistogram(
  input: z.infer<typeof MarketInsightsFormSchema)
) {
  const params: Record<string, string> = {};
  if (input.location) params.where = input.location;
  if (input.jobRole) params.what = input.jobRole;

  const data = await fetchAdzunaAPI('histogram', params);
  return SalaryHistogramResponseSchema.parse(data);
}

/**
 * Fetches the top companies hiring for a given job role.
 */
export async function getTopCompanies(
  input: z.infer<typeof MarketInsightsFormSchema)
) {
  const params: Record<string, string> = {};
  if (input.jobRole) params.what = input.jobRole;

  const data = await fetchAdzunaAPI('top_companies', params);
  return TopCompaniesResponseSchema.parse(data);
}

/**
 * Fetches regional job distribution data (geodata).
 */
export async function getRegionalInsights(
  input: z.infer<typeof MarketInsightsFormSchema)
) {
  const params: Record<string, string> = {};
  if (input.jobRole) params.what = input.jobRole;

  const data = await fetchAdzunaAPI('geodata', params);
  return RegionalInsightsResponseSchema.parse(data);
}
