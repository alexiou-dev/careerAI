import { z } from 'zod';

export const preferencesOptions = [
  'Work-Life Balance',
  'Career Growth Opportunities',
  'Remote-First Culture',
  'Collaborative Environment',
  'Innovation and Tech Focus',
  'Company Stability',
  'Other (please specify)',
] as const;

export const PreferencesSchema = z.enum(preferencesOptions);
export type Preference = z.infer<typeof PreferencesSchema>;

// Schema for the frontend form
export const CompanyFitFormSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  preferences: z.array(PreferencesSchema).min(1, 'Please select at least one preference.'),
  otherPreference: z.string().optional(),
}).refine(data => {
    // If 'Other' is selected, then otherPreference must not be empty.
    if (data.preferences.includes('Other (please specify)') && !data.otherPreference?.trim()) {
        return false;
    }
    return true;
}, {
    message: 'Please specify your "Other" preference.',
    path: ['otherPreference'], // Path to the field that the error message will be attached to.
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
  alignmentAnalysis: z.string().describe("An analysis of how the company aligns with the user's preferences."),
  overallFitScore: z.number().min(0).max(100).describe("A score from 0-100 representing the overall cultural fit."),
  links: z.object({
    glassdoor: z.string().url().describe("Link to Glassdoor reviews"),
    careers: z.string().url().describe("Link to the company’s careers page"),
    news: z.string().url().describe("Link to recent news about the company"),
  }),
});

export type AnalyzeCompanyFitOutput = z.infer<typeof AnalyzeCompanyFitOutputSchema>;


