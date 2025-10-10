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
4.  **Formatting**:
    -   For a **Cover Letter**, the output MUST be plain text. Do not use markdown. Use single empty lines to separate paragraphs.
    -   For a **Thank-You Email** or **Networking Outreach**, the output MUST be in a standard email format. It must begin with "Subject: [Your Subject Here]" on the very first line, followed by the body of the email. Use single empty lines for paragraph breaks.
5.  **Personalize**: Address the document to the hiring manager or contact person if their name is available in the provided context. If not, use a general professional salutation (e.g., "Dear Hiring Team,").

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

