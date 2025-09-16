import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf'];

// === FORMS ===
export const InterviewPrepFormSchema = z.object({
  jobRole: z.string().min(3, 'Job role must be at least 3 characters.'),
  jobDescription: z.string().optional(),
  resume: z
    .any()
    .optional()
    .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf files are accepted.'
    ),
});
export type InterviewPrepFormValues = z.infer<typeof InterviewPrepFormSchema>;

// === AI FLOW SCHEMAS ===

// 1. Generate Questions
export const GenerateQuestionsInputSchema = z.object({
  jobRole: z.string().describe('The job role the user is practicing for.'),
  jobDescription: z.string().optional().describe('The full job description for context.'),
  resumePdfDataUri: z.string().optional().describe(
      "The user's resume in PDF format, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

export const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('A list of 7-10 relevant interview questions.'),
});
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

// 2. Get Example Answer
export const ExampleAnswerInputSchema = z.object({
  jobRole: z.string().describe('The job role for context.'),
  question: z.string().describe('The specific interview question to answer.'),
  resumePdfDataUri: z.string().optional().describe(
    "The user's resume in PDF format, as a data URI that must include a MIME type and use Base64 encoding. If provided, the answer should be based on this resume."
  ),
});
export type ExampleAnswerInput = z.infer<typeof ExampleAnswerInputSchema>;

export const ExampleAnswerOutputSchema = z.object({
  exampleAnswer: z.string().describe('An ideal, well-structured example answer to the question.'),
});
export type ExampleAnswerOutput = z.infer<typeof ExampleAnswerOutputSchema>;

// 3. Get Interview Feedback
const UserAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const InterviewFeedbackInputSchema = z.object({
  jobRole: z.string().describe('The job role for context.'),
  userAnswers: z
    .array(UserAnswerSchema)
    .describe("A list of questions and the user's corresponding answers. Skipped questions are not included."),
});
export type InterviewFeedbackInput = z.infer<typeof InterviewFeedbackInputSchema>;

export const InterviewFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Overall constructive feedback on the user\'s performance, formatted as plain text.'),
});
export type InterviewFeedbackOutput = z.infer<typeof InterviewFeedbackOutputSchema>;


// === LOCAL STORAGE & STATE MANAGEMENT ===
export const InterviewQuestionSchema = z.object({
  question: z.string(),
  userAnswer: z.string(),
  modelAnswer: z.string(),
});
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;

export const StoredInterviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  jobRole: z.string(),
  jobDescription: z.string().optional(),
  resumePdfDataUri: z.string().optional(),
  questions: z.array(InterviewQuestionSchema),
  feedback: z.string(),
  createdAt: z.string().datetime(),
});
export type StoredInterview = z.infer<typeof StoredInterviewSchema>;

