import { z } from 'zod';

export const preferencesOptions = [
  'Work-Life Balance',
  'Career Growth Opportunities',
  'Remote-First Culture',
  'Collaborative Environment',
  'Innovation and Tech Focus',
  'Company Stability',
] as const;

export const PreferencesSchema = z.enum(preferencesOptions);
export type Preference = z.infer<typeof PreferencesSchema>;

// Schema for the frontend form
export const CompanyFitFormSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  preferences: z.array(PreferencesSchema).min(1, 'Please select at least one preference.'),
});

export type CompanyFitFormValues = z.infer<typeof CompanyFitFormSchema>;

// Schema for the AI flow input
export const AnalyzeCompanyFitInputSchema = z.object({
  companyName: z.string().describe('The name of the company to analyze.'),
  userPreferences: z.array(z.string()).describe('A list of cultural preferences from the user.'),
});
export type AnalyzeCompanyFitInput = z.infer<typeof AnalyzeCompanyFitInputSchema>;

// Schema for the AI flow output
export const AnalyzeCompanyFitOutputSchema = z.object({
  companyCultureSummary: z.string().describe("A summary of the company's culture based on public knowledge."),
  alignmentAnalysis: z.string().describe('An analysis of how the company aligns with the user\'s preferences.'),
  overallFitScore: z.number().min(0).max(100).describe('A score from 0-100 representing the overall cultural fit.'),
});
export type AnalyzeCompanyFitOutput = z.infer<typeof AnalyzeCompanyFitOutputSchema>;
