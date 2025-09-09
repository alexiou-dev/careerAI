'use server';

/**
 * @fileOverview Resume generation AI agent that creates a resume from scratch based on user-provided details.
 *
 * - generateResumeFromScratch - A function that handles the resume generation process.
 */

import { ai } from '@/ai/genkit';
import {
    GenerateResumeInputSchema,
    GenerateResumeOutputSchema,
    type GenerateResumeInput,
    type GenerateResumeOutput,
} from '@/types/ai-resume-builder';

export async function generateResumeFromScratch(
  input: GenerateResumeInput
): Promise<GenerateResumeOutput> {
  return generateResumeFromScratchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeFromScratchPrompt',
  input: { schema: GenerateResumeInputSchema },
  output: { schema: GenerateResumeOutputSchema },
  prompt: `You are an expert resume writer. Your task is to generate a professional resume using the provided structured data.

**CRITICAL FORMATTING RULES:**
- The output MUST be plain text only.
- DO NOT use any markdown characters. This means NO '#' for headers, NO '*' for bold or italics.
- Use ALL CAPS for section titles (e.g., "WORK EXPERIENCE", "EDUCATION", "SKILLS").
- Start bullet points for job responsibilities or activities with a '•' character, followed by a space.
- Use single empty lines to separate sections and entries.
- For the header, format the contact info line like this: City, Country | email@email.com | +phone | LinkedIn | GitHub | Portfolio. Only include the links/info if provided.

**User's Resume Data:**

**Personal Details:**
- Full Name: {{fullName}}
- Job Title: {{jobTitle}}
- Email: {{email}}
- Phone: {{phone}}
- Location: {{city}}, {{country}}
{{#if linkedin}}- LinkedIn: {{linkedin}}{{/if}}
{{#if github}}- GitHub: {{github}}{{/if}}
{{#if portfolio}}- Portfolio: {{portfolio}}{{/if}}

**Summary:**
{{{summary}}}

**Work Experience:**
{{#each workExperience}}
- Job Title: {{jobTitle}}
- Company: {{company}}
- Location: {{location}}
- Dates: {{startDate}} – {{endDate}}
- Responsibilities:
{{{responsibilities}}}
{{/each}}

**Education:**
{{#each education}}
- School: {{school}}
- Location: {{location}}
- Degree: {{degree}} in {{fieldOfStudy}}
- Dates: {{startDate}} – {{endDate}}
{{/each}}
{{#if leadership}}
**Leadership & Activities:**
{{#each leadership}}
- Organization/Project: {{organization}}
- Role: {{role}}
- Description:
{{{description}}}
{{/each}}
{{/if}}

**Skills:**
- Technical Skills: {{technicalSkills}}
{{#if programmingSkills}}- Programming Skills: {{programmingSkills}}{{/if}}
- Languages: {{languages}}

Now, generate the complete resume based on the data and formatting rules.`,
});


const generateResumeFromScratchFlow = ai.defineFlow(
  {
    name: 'generateResumeFromScratchFlow',
    inputSchema: GenerateResumeInputSchema,
    outputSchema: GenerateResumeOutputSchema,
  },
  async (input) => {
    // Reformat responsibilities and descriptions to ensure they are bulleted.
    const processedInput = {
        ...input,
        workExperience: input.workExperience.map(exp => ({
            ...exp,
            responsibilities: exp.responsibilities ? exp.responsibilities.split('\n').map(line => line.trim().startsWith('•') ? line : `• ${line}`).join('\n') : ''
        })),
        leadership: input.leadership && Array.isArray(input.leadership) ? input.leadership.map(lead => ({
            ...lead,
            description: lead.description ? lead.description.split('\n').map(line => line.trim().startsWith('•') ? line : `• ${line}`).join('\n') : ''
        })) : [],
    };
    try {
        const { output } = await prompt(processedInput);
        return output!;
    } catch (error: any) {
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            throw new Error('RATE_LIMIT_EXCEEDED');
        }
        throw error;
    }
  }
);
