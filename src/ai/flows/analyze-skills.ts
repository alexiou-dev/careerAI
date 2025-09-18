'use server';

/**
 * @fileOverview AI agent for analyzing skill gaps between a resume and a job description.
 *
 * - analyzeJobSkills - A function that handles the skill gap analysis and generates a learning roadmap.
 */

import {ai} from '@/ai/genkit';
import {
  AnalyzeSkillsInputSchema,
  AnalyzeSkillsOutputSchema,
  type AnalyzeSkillsInput,
  type SkillAnalysis,
} from '@/types/ai-skills';
import {z} from 'zod';

const analysisPrompt = ai.definePrompt({
  name: 'skillGapAnalysisPrompt',
  input: {schema: AnalyzeSkillsInputSchema},
  output: {schema: AnalyzeSkillsOutputSchema},
  prompt: `You are an expert career development coach and curriculum designer. Your task is to analyze a user's resume against a job description, identify critical skill gaps, and generate a step-by-step learning roadmap for each gap.

**Context:**
- User's Resume PDF: {{media url=resumePdfDataUri}}
- Job Description: {{{jobDescription}}}

**Instructions:**
1.  **Extract Skills**: Identify the key technical skills, tools, and programming languages from both the resume and the job description.
2.  **Identify the Gap**: Compare the two lists and identify up to 3-4 of the most important skills that are present in the job description but are missing or underrepresented in the resume.
3.  **Handle No Gaps**: If no significant skill gaps are found, or if the resume is a very strong match for the job description, set the 'message' field in your output to a positive confirmation like "Great news! Your resume is a strong match for this role. No significant skill gaps were found." and leave the 'skillGaps' array empty.
4.  **Generate Learning Roadmaps**: For each identified skill gap, create a concise, actionable learning roadmap with 3-5 steps. The roadmap should be a logical progression from foundational concepts to more advanced application.
    - Example for "React":
        1. Master JavaScript fundamentals (ES6+), including concepts like closures, promises, and async/await.
        2. Learn React basics: components, props, state, and the component lifecycle.
        3. Build small projects using hooks like useState, useEffect, and useContext.
        4. Explore advanced state management with Redux or Zustand.
        5. Understand routing with React Router and deploying a React application.
5.  **Format the Output**: Return a JSON object containing:
    - \`skillGaps\`: An array where each object has:
        - \`skill\`: The name of the missing skill.
        - \`roadmap\`: An array of strings, where each string is a step in the learning plan.
    - \`message\`: An optional string for when no gaps are found.

Generate the analysis based on these instructions. Do not recommend specific websites, courses, or external links. Focus on the concepts and steps to learn.`,
});

export async function analyzeJobSkills(
  input: AnalyzeSkillsInput
): Promise<SkillAnalysis> {
    const { output } = await analysisPrompt(input);
    if (!output) {
        throw new Error("Failed to get analysis from AI.");
    }
    return output;
}
