'use server';

/**
 * @fileOverview AI agent for analyzing company culture and fit.
 *
 * - analyzeCompanyFit - A function that handles the company fit analysis.
 */

import { ai } from '@/ai/genkit';
import {
  AnalyzeCompanyFitInputSchema,
  AnalyzeCompanyFitOutputSchema,
  type AnalyzeCompanyFitInput,
  type AnalyzeCompanyFitOutput,
} from '@/types/ai-company-fit';

export async function analyzeCompanyFit(
  input: AnalyzeCompanyFitInput
): Promise<AnalyzeCompanyFitOutput> {
  return analyzeCompanyFitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCompanyFitPrompt',
  input: { schema: AnalyzeCompanyFitInputSchema },
  output: { schema: AnalyzeCompanyFitOutputSchema },
  prompt: `You are an expert career and company culture analyst. Your task is to analyze a company based on public knowledge and assess its fit with a user's stated preferences.

**Company to Analyze:**
{{companyName}}

**User's Key Preferences:**
{{#each userPreferences}}
- {{{this}}}
{{/each}}

**Instructions:**

1.  **Summarize Company Culture**: Based on your knowledge from public sources (like news articles, mission statements, and employee reviews on sites like Glassdoor), write a concise summary of the company culture for **{{companyName}}**. Touch upon aspects like work environment, values, and employee treatment.

2.  **Analyze Alignment**: Write a detailed analysis of how the company's culture aligns with each of the user's stated preferences. For each preference, explain why the company is a good or poor match.

3.  **Calculate Overall Fit Score**: Provide an "Overall Fit Score" from 0 to 100. A score of 100 means a perfect match, while a score of 0 means no match at all. This score should be a direct reflection of your alignment analysis. Be realistic.

Generate the analysis based on these instructions.`,
});

const analyzeCompanyFitFlow = ai.defineFlow(
  {
    name: 'analyzeCompanyFitFlow',
    inputSchema: AnalyzeCompanyFitInputSchema,
    outputSchema: AnalyzeCompanyFitOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
