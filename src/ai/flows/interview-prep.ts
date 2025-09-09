'use server';

/**
 * @fileOverview AI agents for conducting a structured mock interview experience.
 *
 * - generateInterviewQuestions: Creates a list of questions for a given role.
 * - getExampleAnswer: Provides an ideal answer to a specific interview question.
 * - getInterviewFeedback: Gives feedback on the user's answers at the end of the interview.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  GenerateQuestionsInputSchema,
  GenerateQuestionsOutputSchema,
  ExampleAnswerInputSchema,
  ExampleAnswerOutputSchema,
  InterviewFeedbackInputSchema,
  InterviewFeedbackOutputSchema,
  type GenerateQuestionsInput,
  type GenerateQuestionsOutput,
  type ExampleAnswerInput,
  type ExampleAnswerOutput,
  type InterviewFeedbackInput,
  type InterviewFeedbackOutput,
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

    Your task is to generate a list of 7-10 highly relevant interview questions for this role.
    The questions should cover a mix of behavioral, technical, and situational topics.
    Start with a classic opening question like "Tell me about yourself." or "Walk me through your resume."
    `,
  });

  const { output } = await prompt(input);
  return output!;
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

    The answer should be a single paragraph and get straight to the point, as one would in a real interview. It should follow best practices, such as the STAR method for behavioral questions if applicable.
    Your response should ONLY be the example answer text. Do not add any conversational filler or introductory phrases like "Here is a good answer:".
    `,
  });
  const { output } = await prompt(input);
  return output!;
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
    
    Here are the questions they were asked and the answers they provided. Some questions may not have an answer if the user skipped them.
    
    {{#each userAnswers}}
      **Question**: {{{question}}}
      **Answer**: {{{answer}}}
    {{/each}}
    
    **Instructions:**
    1.  Analyze the user's answers provided above. Do NOT comment on skipped questions.
    2.  Provide a concise, overall summary of their performance.
    3.  Give 2-3 specific, actionable pieces of feedback for improvement. Frame these as "Areas for Improvement".
    4.  Highlight 1-2 things the candidate did well. Frame these as "Strengths".
    5.  The feedback should be encouraging and constructive.
    6.  The output MUST be plain text. Do not use markdown. Use single empty lines to separate paragraphs.
    `,
  });
  const { output } = await prompt(input);
  return output!;
}

    
