import { z } from 'zod';

// Schema for the frontend form
export const MarketInsightsFormSchema = z.object({
  jobRole: z.string().min(1, 'Job role is required.'),
  location: z.string().min(1, 'Location is required (e.g., a city or country).'),
});
export type MarketInsightsFormValues = z.infer<typeof MarketInsightsFormSchema>;

// Schema for Salary Histogram API response
export const SalaryHistogramSchema = z.record(z.number());
export type SalaryHistogram = z.infer<typeof SalaryHistogramSchema>;

export const SalaryHistogramResponseSchema = z.object({
  histogram: SalaryHistogramSchema,
});

// Schema for Top Companies API response
export const TopCompanySchema = z.object({
  count: z.number(),
  canonical_name: z.string(),
});
export type TopCompany = z.infer<typeof TopCompanySchema>;

export const TopCompaniesResponseSchema = z.object({
  leaderboard: z.array(TopCompanySchema),
});

// Schema for Regional Insights (Geodata) API response
export const RegionalInsightSchema = z.object({
  location: z.object({
    display_name: z.string(),
  }),
  count: z.number(),
});

export type RegionalInsight = z.infer<typeof RegionalInsightSchema>;

export const RegionalInsightsResponseSchema = z.object({
  locations: z.array(RegionalInsightSchema),
});
