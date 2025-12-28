'use server';

/**
 * This flow analyzes company culture and assesses alignment with user preferences.
 * It combines AI analysis with external data sources (Glassdoor, company websites, news).
 * 
 * Features:
 * - Company culture analysis using AI
 * - Preference alignment scoring
 * - External link gathering (Glassdoor, careers page, news)
 */

// AI integration for company analysis
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  AnalyzeCompanyFitInputSchema,
  AnalyzeCompanyFitOutputSchema,
  type AnalyzeCompanyFitInput,
  type AnalyzeCompanyFitOutput,
} from '@/types/ai-company-fit';
// External API for web searches
import { googleSearch } from '@/lib/googleSearch';

// ---------------------
// MAIN EXPORT FUNCTION
// ---------------------

/**
 * Analyze Company Fit
 * 
 * Main entry point for company culture analysis.
 * Wraps the AI flow with proper typing and error handling.
 */
export async function analyzeCompanyFit(
  input: AnalyzeCompanyFitInput
): Promise<AnalyzeCompanyFitOutput> {
  // Delegate to the defined AI flow
  return analyzeCompanyFitFlow(input);
}


// ---------------------
// TOOL: FIND COMPANY INFORMATION
// ---------------------

/**
 * Tool: Find Company Information
 * 
 * Searches for key public URLs related to a company:
 * 1. Careers page - Company's official job listings
 * 2. Glassdoor page - Employee reviews and ratings
 * 3. News search - Recent company news and updates
 * 
 * Uses Google Custom Search API via googleSearch helper.
 * Falls back to Google search URLs if specific pages not found.
 */
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
        // Use Google Custom Search API
        const results = await googleSearch(query);
        // Return first result or fallback to Google search
        return results[0]?.url || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      } catch (e) {
        // On error, return Google search URL as fallback
        return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
    };

    /**
     * Parallel URL Fetching
     * Fetch careers and Glassdoor URLs simultaneously for performance.
     * News URL is constructed directly (no API call needed).
     */
    const [careersUrl, glassdoorUrl] = await Promise.all([
      // Search for company careers page
      findUrl(`${companyName} careers`),
      // Search for Glassdoor reviews
      findUrl(`${companyName} glassdoor`),
    ]);

    const newsUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName)}&tbm=nws`;

    return { careersUrl, glassdoorUrl, newsUrl };
  }
);

// ---------------------
// PROMPT: COMPANY FIT ANALYSIS
// ---------------------

/**
 * AI Prompt: Analyze Company Fit
 * 
 * Structured prompt template for Gemini AI to analyze company culture.
 * 
 * Prompt Structure:
 * 1. Role definition (expert career analyst)
 * 2. Company and user preferences context
 * 3. Detailed instructions for analysis
 * 4. Output format specification
 */
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

Company Culture Summary: Write a single, concise paragraph summarizing {{companyName}}'s culture, leadership influence, values, collaboration style, flexibility, innovation focus, and work environment. Avoid mentioning numeric ratings or scores. At the end of the paragraph, don't show  three clickable links to sources (Glassdoor, company website, news articles):

Alignment with Your Preferences: For each user preference, write a narrative explaining how the company aligns or does not align with it. Give specific examples when possible. Structure each preference as:
Regarding {Preference Name}: Description of alignment, strengths, weaknesses, and context.

Overall Fit Score: Provide a realistic score from 0-100 that reflects the alignment analysis (but do not include numeric scores in the narrative paragraphs above; the user sees the score separately). Do not include links.

Output Format: Return all text as a single string with the structure:

Company Culture Summary  
[Summary paragraph]

Alignment with Your Preferences  
Regarding Work-Life Balance: ...  
Regarding Career Growth Opportunities: ...  

Learn more...

Generate the analysis according to these instructions.`
});

// ---------------------
// FLOW: COMPANY FIT ANALYSIS
// ---------------------

/**
 * AI Flow: Analyze Company Fit
 * 
 * Orchestrates the complete company analysis workflow:
 * 1. Find company information (URLs)
 * 2. Generate AI analysis using prompt
 * 3. Combine results with external links
 * 4. Handle rate limiting gracefully
 */
const analyzeCompanyFitFlow = ai.defineFlow(
  {
    name: 'analyzeCompanyFitFlow',
    inputSchema: AnalyzeCompanyFitInputSchema,
    outputSchema: AnalyzeCompanyFitOutputSchema,
  },
  async (input) => {
    /**
     * Step 1: Gather Company Information
     * Fetch external URLs before AI analysis.
     */
    const companyInfo = await findCompanyInfo({ companyName: input.companyName });

    try {
      /**
       * Step 2: Generate AI Analysis
       * Use the defined prompt with company name and user preferences.
       * The AI will analyze culture and calculate fit score.
       */
      const { output } = await prompt({
        ...input,
        companyName: input.companyName,
        userPreferences: input.userPreferences,
      });

      /**
       * Step 3: Combine Results
       * 
       * Merge AI analysis with external URLs.
       * This creates a complete analysis package.
       */
      return {
        ...output!,
        links: {
          glassdoor: companyInfo.glassdoorUrl,
          careers: companyInfo.careersUrl,
          news: companyInfo.newsUrl,
        },
      };
    } catch (err: any) {
      /**
       * Step 4: Error Handling
       */
      if (err.message.includes("429") || err.message.includes("Too Many Requests")) {
        /**
         * Graceful Degradation for Rate Limits
         */
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
      throw err;
    }
  }
);


