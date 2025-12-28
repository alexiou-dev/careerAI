'use server';

/**
 * @fileOverview AI agent for generating professional documents like cover letters.
 *
 * This flow generates various career-related documents using AI:
 * - Cover letters
 * - Thank-you emails
 * - Networking outreach
 * 
 * It analyzes both the user's resume and target job description to create personalized content.
 * 
 * Features:
 * - Context-aware document generation
 * - Resume analysis for personalization
 * - Job description alignment
 * - Multiple document type support
 */

// AI integration for document generation
import {ai} from '@/ai/genkit';
import {
  GenerateDocumentInput,
  GenerateDocumentInputSchema,
  GenerateDocumentOutput,
  GenerateDocumentOutputSchema,
} from '@/types/ai-documents';

// ---------------------
// MAIN EXPORT FUNCTION
// ---------------------
export async function generateDocument(
  input: GenerateDocumentInput
): Promise<GenerateDocumentOutput> {
  // Delegate to the defined AI flow
  return generateDocumentFlow(input);
}

// ---------------------
// AI PROMPT DEFINITION
// ---------------------

/**
 * AI Prompt: Professional Document Generation
 * 
 * Structured prompt for generating various career documents.
 * Uses media attachment for resume PDF analysis and conditional formatting.
 * 
 * Prompt Structure:
 * 1. Role definition (expert career coach and professional writer)
 * 2. Context: Resume PDF + Job Description + Document Type
 * 3. Step-by-step generation instructions
 * 4. Formatting rules based on document type
 * 5. Personalization guidance
 */
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

// ---------------------
// AI FLOW DEFINITION
// ---------------------

/**
 * AI Flow: Document Generation Workflow
 * 
 * Orchestrates the complete document generation process:
 * 1. Execute AI prompt with resume and job description
 * 2. Handle rate limiting gracefully
 * 3. Return formatted document text
 */
const generateDocumentFlow = ai.defineFlow(
  {
    name: 'generateDocumentFlow',
    inputSchema: GenerateDocumentInputSchema,
    outputSchema: GenerateDocumentOutputSchema,
  },
  async input => {
    try {
      /**
       * Step 1: Execute AI Generation
       */
      const {output} = await prompt(input);
      /**
       * Step 2: Return Generated Document
       */
      return output!;
    } catch (error: any) {
      /**
       * Step 3: Error Handling
       */
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      throw error;
    }
  }
);

