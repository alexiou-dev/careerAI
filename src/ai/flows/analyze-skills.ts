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

export const analysisPrompt = ai.definePrompt({
  name: 'skillGapAnalysisPrompt',
  input: { schema: AnalyzeSkillsInputSchema },
  output: { schema: AnalyzeSkillsOutputSchema },
  prompt: `
You are an expert career coach and curriculum designer. Analyze the user's resume against a job description, identify missing skills, and create a multi-stage learning roadmap for each missing skill.

Context:
- Resume PDF (data URI): {{media url=resumePdfDataUri}}
- Job Description: {{{jobDescription}}}

Instructions:
1. Extract all key technical and soft skills from the job description.
2. Compare with the user's resume and identify up to 3-5 most important missing skills.
3. For each missing skill, generate a step-by-step multi-stage roadmap inspired by this structure:

🌟 STAGE 1: FOUNDATIONS (Beginner Level)
Goal: Brief goal for foundational understanding
📘Topics: List of 4-6 key topics
🛠 Resources: List of books, courses, or tools (conceptual only; do not give direct URLs)
✅ Assignments: 2-3 practical exercises

🌟 STAGE 2: CORE PRINCIPLES (Intermediate Level)
Goal: Brief goal for intermediate mastery
📘Topics: 4-6 intermediate topics
🛠 Resources: Conceptual references
✅ Assignments: 2-3 exercises or mini-projects

🌟 STAGE 3: ADVANCED APPLICATION (Advanced Level)
Goal: Goal for advanced mastery
📘Topics: 4-6 advanced topics
🛠 Resources: Conceptual references
✅ Assignments: 2-3 exercises or projects

🌟 STAGE 4: RESEARCH & APPLICATION (Optional)
Goal: Optional projects, contributions, or experiments
🧠 Ideas: Suggestions for applying skills
🧪 Tools to Learn: Relevant software, frameworks, or languages
Suggested Timeline: Flexible duration for each stage

4. If the resume already covers the skill well, return a positive confirmation in "message" like: "Your resume is a strong match for this skill. No further learning needed."
5. Format output as JSON:
- skillGaps: array of objects
  - skill: string
  - roadmap: array of strings, each string contains one stage formatted as above
- message: optional string if no gaps

Do not include external links, URLs, or company-specific resources. Focus on concepts and steps to learn.
`
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
