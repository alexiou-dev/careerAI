
'use server';

/**
 * @fileOverview AI agent for analyzing skill gaps between a resume and a job description.
 *
 * - analyzeSkills - A function that handles the skill gap analysis.
 */

import {ai} from '@/ai/genkit';
import {
  AnalyzeSkillsInputSchema,
  AnalyzeSkillsOutputSchema,
  type AnalyzeSkillsInput,
  type AnalyzeSkillsOutput,
} from '@/types/ai-skills';
import {z} from 'zod';
import { findRelevantJobPostings } from './ai-job-finder';

export async function analyzeSkills(
  input: AnalyzeSkillsInput
): Promise<AnalyzeSkillsOutput> {
  return analyzeSkillsFlow(input);
}

const findRelevantJobsForSkill = ai.defineTool(
    {
        name: 'findRelevantJobsForSkill',
        description: 'Find real-world job postings that require a specific skill.',
        inputSchema: z.object({
            skill: z.string().describe('The skill to search for.'),
        }),
        outputSchema: z.object({
            jobs: z.array(z.object({
                title: z.string(),
                url: z.string().url(),
            })).describe('A list of up to 3 job postings found.'),
        }),
    },
    async (input) => {
        console.log(`Using tool to find jobs for skill: ${input.skill}`);
        const results = await findRelevantJobPostings({ jobRole: input.skill });
        return { jobs: results.jobPostings.slice(0, 3) };
    }
);


const prompt = ai.definePrompt({
  name: 'analyzeSkillsPrompt',
  input: {schema: AnalyzeSkillsInputSchema},
  output: {schema: AnalyzeSkillsOutputSchema},
  tools: [findRelevantJobsForSkill],
  prompt: `You are an expert career development coach. Your task is to analyze a user's resume against a job description, identify key skill gaps, and provide actionable learning recommendations.

**Context:**
- User's Resume PDF: {{media url=resumePdfDataUri}}
- Job Description: {{{jobDescription}}}

**Instructions:**
1.  **Extract User's Skills**: Read the resume and identify the user's key technical skills, tools, and programming languages.
2.  **Extract Required Skills**: Read the job description and identify the key skills, technologies, and qualifications required for the role.
3.  **Identify the Gap**: Compare the two lists and identify up to 5 of the most important skills that are present in the job description but seem to be missing or underrepresented in the resume.
4.  **Provide Learning Recommendations**: For each missing skill:
    a. Use the \`findRelevantJobsForSkill\` tool to get examples of real jobs that require this skill. This provides context on how the skill is valued in the industry.
    b. Based on the job examples, provide a concise, actionable recommendation. This should include a specific online course (from Coursera, Udemy, or a high-quality YouTube channel), a book, or a project idea that would help the user learn that skill.
    c. **You must include a direct URL to the resource you are recommending.**
5.  **Format the Output**: Return a list of objects, where each object contains the missing 'skill' and the 'recommendation'. Do not include skills the user already has. If there are no obvious skill gaps, return an empty array.

Generate the skill gap analysis based on these instructions.`,
});

const analyzeSkillsFlow = ai.defineFlow(
  {
    name: 'analyzeSkillsFlow',
    inputSchema: AnalyzeSkillsInputSchema,
    outputSchema: AnalyzeSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
