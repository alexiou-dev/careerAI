'use server';

/**
 * @fileOverview Resume tailoring AI agent that optimizes a PDF resume to match a given job description.
 *
 * - tailorResume - A function that handles the resume tailoring process.
 * - TailorResumeInput - The input type for the tailorResume function.
 * - TailorResumeOutput - The return type for the tailorResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TailorResumeInputSchema = z.object({
  resumePdfDataUri: z
    .string()
    .describe(
      "The resume in PDF format, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
});
export type TailorResumeInput = z.infer<typeof TailorResumeInputSchema>;

const TailorResumeOutputSchema = z.object({
  tailoredResume: z.string().describe('The tailored resume text, formatted as plain text without any markdown (e.g. no # or *).'),
});
export type TailorResumeOutput = z.infer<typeof TailorResumeOutputSchema>;

export async function tailorResume(input: TailorResumeInput): Promise<TailorResumeOutput> {
  return tailorResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tailorResumePrompt',
  input: {schema: TailorResumeInputSchema},
  output: {schema: TailorResumeOutputSchema},
  prompt: `You are an expert resume writer. Your task is to optimize the provided resume to perfectly match the given job description.

Resume PDF: {{media url=resumePdfDataUri}}
Job Description: {{{jobDescription}}}

**CRITICAL FORMATTING RULES:**
- The output MUST be plain text only.
- DO NOT use any markdown characters. This means NO '#' for headers, NO '*' for bold or italics, and NO '-' for lists.
- Use ALL CAPS for section titles (e.g., "PROFESSIONAL EXPERIENCE", "EDUCATION").
- Use single empty lines to separate paragraphs and sections.
- For bullet points under a job, start each line with a simple '•' character, followed by a space.

Focus on **keyword optimization, ATS readability, and clear, concise language**. Generate the tailored resume based on these strict rules.`,
});

const tailorResumeFlow = ai.defineFlow(
  {
    name: 'tailorResumeFlow',
    inputSchema: TailorResumeInputSchema,
    outputSchema: TailorResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
