'use server';

/**
 * @fileOverview AI agent for generating professional documents like cover letters.
 *
 * - generateDocument - A function that handles the document generation process.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateDocumentInput,
  GenerateDocumentInputSchema,
  GenerateDocumentOutput,
  GenerateDocumentOutputSchema,
} from '@/types/ai-documents';

export async function generateDocument(
  input: GenerateDocumentInput
): Promise<GenerateDocumentOutput> {
  return generateDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDocumentPrompt',
  input: {schema: GenerateDocumentInputSchema},
  output: {schema: GenerateDocumentOutputSchema},
  prompt: `You are an expert career coach and professional writer. Your task is to write a high-quality, personalized {{documentType}}.

**Context:**
- User's Resume PDF: {{media url=resumePdfDataUri}}
- Job Description: {{{jobDescription}}}

**Instructions:**
1.  **Analyze**: Thoroughly analyze the user's resume and the job description.
2.  **Synthesize**: Identify the most relevant skills, experiences, and qualifications from the resume that match the requirements in the job description.
3.  **Write**: Draft a compelling {{documentType}} that is tailored to the specific job.
    -   If it's a **Cover Letter**, it should be professional, concise, and highlight the user's fit for the role. It should have a clear introduction, body, and conclusion.
    -   If it's a **Thank-You Email**, it should be polite, professional, and express gratitude for the interview opportunity, briefly reiterating interest in the role.
    -   If it's a **Networking Outreach** message, it should be concise, professional, and clearly state the purpose of the outreach, whether it's for an informational interview or to inquire about opportunities.
4.  **Formatting**: The output MUST be plain text. Do not use any markdown. Use single empty lines to separate paragraphs.
5.  **Personalize**: Address the letter to the hiring manager if their name is available in the job description. If not, use a general professional salutation.

Generate the {{documentType}} based on these instructions.`,
});

const generateDocumentFlow = ai.defineFlow(
  {
    name: 'generateDocumentFlow',
    inputSchema: GenerateDocumentInputSchema,
    outputSchema: GenerateDocumentOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      throw error;
    }
  }
);
