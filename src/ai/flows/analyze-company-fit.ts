'use server';

/**
 * @fileOverview AI agent for analyzing company culture and fit.
 *
 * - analyzeCompanyFit - A function that handles the company fit analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  AnalyzeCompanyFitInputSchema,
  AnalyzeCompanyFitOutputSchema,
  type AnalyzeCompanyFitInput,
  type AnalyzeCompanyFitOutput,
} from '@/types/ai-company-fit';
import { googleSearch } from '@/lib/googleSearch';

export async function analyzeCompanyFit(
  input: AnalyzeCompanyFitInput
): Promise<AnalyzeCompanyFitOutput> {
  return analyzeCompanyFitFlow(input);
}

const findCompanyInfo = ai.defineTool(
  {
    name: 'findCompanyInfo',
    description: 'Finds key public URLs for a company: their careers page, Glassdoor page, and a Google News search.',
    inputSchema: z.object({ companyName: z.string() }),
    outputSchema: z.object({
      careersUrl: z.string().url(),
      glassdoorUrl: z.string().url(),
      newsUrl: z.string().url(),
    }),
  },
  async ({ companyName }) => {
    // This is a helper to find the most likely URL from search results.
    const findUrl = async (query: string) => {
      try {
        const results = await googleSearch(query);
        return results[0]?.url || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      } catch (e) {
        return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
    };

    const [careersUrl, glassdoorUrl] = await Promise.all([
      findUrl(`${companyName} careers`),
      findUrl(`${companyName} glassdoor`),
    ]);

    const newsUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName)}&tbm=nws`;

    return { careersUrl, glassdoorUrl, newsUrl };
  }
);


const prompt = ai.definePrompt({
  name: 'analyzeCompanyFitPrompt',
  input: { schema: AnalyzeCompanyFitInputSchema },
  output: { schema: AnalyzeCompanyFitOutputSchema },
  prompt: `You are an expert career and company culture analyst. Your task is to analyze a company based on public knowledge and assess its fit with a user's stated preferences.

Company to Analyze: {{companyName}}

User's Key Preferences:
{{#each userPreferences}}
- {{{this}}}
{{/each}}

Instructions:

Company Culture Summary: Write a single, concise paragraph summarizing {{companyName}}'s culture, leadership influence, values, collaboration style, flexibility, innovation focus, and work environment. Avoid mentioning numeric ratings or scores. At the end of the paragraph, include three clickable links to sources (Glassdoor, company website, news articles) formatted exactly like this (Markdown):

Learn more:  
- [Glassdoor Reviews]({{glassdoorUrl}})  
- [Company Careers]({{careersUrl}})  
- [Recent News Coverage]({{newsUrl}})

Alignment with Your Preferences: For each user preference, write a narrative explaining how the company aligns or does not align with it. Give specific examples when possible. Structure each preference as:
Regarding {Preference Name}: Description of alignment, strengths, weaknesses, and context.

Overall Fit Score: Provide a realistic score from 0-100 that reflects the alignment analysis (but do not include numeric scores in the narrative paragraphs above; the user sees the score separately).

Output Format: Return all text as a single string with the structure:

Company Culture Summary  
[Summary paragraph]

Learn more:  
- [Glassdoor Reviews]({{glassdoorUrl}})  
- [Company Careers]({{careersUrl}})  
- [Recent News Coverage]({{newsUrl}})

Alignment with Your Preferences  
Regarding Work-Life Balance: ...  
Regarding Career Growth Opportunities: ...  

Generate the analysis according to these instructions.`
});


const analyzeCompanyFitFlow = ai.defineFlow(
  {
    name: 'analyzeCompanyFitFlow',
    inputSchema: AnalyzeCompanyFitInputSchema,
    outputSchema: AnalyzeCompanyFitOutputSchema,
  },
  async (input) => {
    const companyInfo = await findCompanyInfo({ companyName: input.companyName });

    try {
      const { output } = await prompt({
        ...input,
        companyName: input.companyName,
        userPreferences: input.userPreferences,
      });

      return {
        ...output!,
        links: {
          glassdoor: companyInfo.glassdoorUrl,
          careers: companyInfo.careersUrl,
          news: companyInfo.newsUrl,
        },
      };
    } catch (err: any) {
      if (err.message.includes("429") || err.message.includes("Too Many Requests")) {
        // Instead of throwing, return a friendly message
        return {
          companyCultureSummary: "The AI service quota has been reached for today. Please try again later or check your API quota.",
          alignmentAnalysis: "",
          overallFitScore: 0,
          links: {
            glassdoor: companyInfo.glassdoorUrl,
            careers: companyInfo.careersUrl,
            news: companyInfo.newsUrl,
          },
        };
      }

      // rethrow other errors as usual
      throw err;
    }
  }
);

