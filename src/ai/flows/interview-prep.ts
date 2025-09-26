'use server';

/**
 * @fileOverview AI agents for conducting a structured mock interview experience.
 *
 * - generateInterviewQuestions: Creates a list of questions for a given role.
 * - getExampleAnswer: Provides an ideal answer to a specific interview question.
 * - getInterviewFeedback: Gives feedback on the user's answers at the end of the interview.
 * - getInterviewScore: Generates a numerical score based on user's answers.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateQuestionsInputSchema,
  GenerateQuestionsOutputSchema,
  ExampleAnswerInputSchema,
  ExampleAnswerOutputSchema,
  InterviewFeedbackInputSchema,
  InterviewFeedbackOutputSchema,
  InterviewScoreInputSchema,
  InterviewScoreOutputSchema,
  type GenerateQuestionsInput,
  type GenerateQuestionsOutput,
  type ExampleAnswerInput,
  type ExampleAnswerOutput,
  type InterviewFeedbackInput,
  type InterviewFeedbackOutput,
  type InterviewScoreInput,
  type InterviewScoreOutput,
} from '@/types/ai-interview';

/**
 * Generates a list of tailored interview questions.
 */
export async function generateInterviewQuestions(
  input: GenerateQuestionsInput
): Promise<GenerateQuestionsOutput> {
  const prompt = ai.definePrompt({
    name: 'generateInterviewQuestionsPrompt',
    input: { schema: GenerateQuestionsInputSchema },
    output: { schema: GenerateQuestionsOutputSchema },
    prompt: `You are an expert hiring manager for the role of {{jobRole}}.
    {{#if jobDescription}}
    The candidate has provided the following job description for context:
    ---
    {{{jobDescription}}}
    ---
    {{/if}}
    {{#if resumePdfDataUri}}
    The candidate has provided their resume for context. Analyze it to ask specific questions about their experience, skills, or employment history (including any gaps).
    Resume: {{media url=resumePdfDataUri}}
    ---
    {{/if}}

    Your task is to generate a list of 7-10 highly relevant interview questions for this role.
    The questions should cover a mix of behavioral, technical, and situational topics.
    If a resume was provided, include at least 1 question that directly reference the resume content.
    Start with a classic opening question like "Tell me about yourself." or "Walk me through your resume."
    `,
  });

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

/**
 * Generates an example (ideal) answer for a given interview question.
 */
export async function getExampleAnswer(
  input: ExampleAnswerInput
): Promise<ExampleAnswerOutput> {
  const prompt = ai.definePrompt({
    name: 'getExampleAnswerPrompt',
    input: { schema: ExampleAnswerInputSchema },
    output: { schema: ExampleAnswerOutputSchema },
    prompt: `You are an expert interview coach. A candidate is preparing for an interview for the role of {{jobRole}}.
    Provide an ideal, well-structured, and concise example answer to the following interview question:
    
    "{{{question}}}"

    {{#if resumePdfDataUri}}
    The candidate has provided their resume for context. The example answer MUST be grounded in the experience, skills, and history presented in the resume. Do not invent facts or experiences not present in the document.
    Resume: {{media url=resumePdfDataUri}}
    ---
    {{/if}}

    {{#if userContext}}
    Additional user-provided instructions to consider when generating the answer:
    ---
    {{{userContext}}}
    ---
    {{/if}}

    The answer should be a single paragraph and get straight to the point, as one would in a real interview. It should follow best practices, such as the STAR method for behavioral questions if applicable.
    Your response should ONLY be the example answer text. Do not add any conversational filler or introductory phrases like "Here is a good answer:".
    `,
  });
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

/**
 * Provides overall feedback on a user's interview performance.
 */
export async function getInterviewFeedback(
  input: InterviewFeedbackInput
): Promise<InterviewFeedbackOutput> {
  const prompt = ai.definePrompt({
    name: 'getInterviewFeedbackPrompt',
    input: { schema: InterviewFeedbackInputSchema },
    output: { schema: InterviewFeedbackOutputSchema },
    prompt: `You are an expert interview coach providing final feedback to a candidate who just completed a mock interview for the role of {{jobRole}}.
    
    Here are the questions they were asked and the answers they provided.
    
    {{#each userAnswers}}
      **Question**: {{{question}}}
      **Answer**: {{{answer}}}
    {{/each}}
    
    Your task is to generate constructive 'feedback' as a plain text string. The feedback text should contain:
    - A concise overall summary.
    - 2-3 "Areas for Improvement".
    - 1-2 "Strengths".
    - If a recording was used, comment on delivery (pacing, clarity, filler words) under "Delivery Feedback".
    - The feedback must be encouraging and use single empty lines to separate paragraphs. Do not use markdown.
    `,
  });
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


/**
 * Generates a numerical score based on the user's interview performance.
 */
export async function getInterviewScore(
  input: InterviewScoreInput
): Promise<InterviewScoreOutput> {
  const prompt = ai.definePrompt({
    name: 'getInterviewScorePrompt',
    input: { schema: InterviewScoreInputSchema },
    output: { schema: InterviewScoreOutputSchema },
    prompt: `You are an expert interview coach. Based on the following questions and user answers for the role of {{jobRole}}, provide a numerical score from 0-100 evaluating the overall quality of the user's responses.
      
      {{#each userAnswers}}
        **Question**: {{{question}}}
        **Answer**: {{{answer}}}
      {{/each}}

      Your response MUST only be the JSON object with the score.
    `,
  });

  try {
    const { output } = await prompt(input);
    return output!;
  } catch (error: any) {
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    throw error;
  }
}
       
