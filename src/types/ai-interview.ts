import {z} from 'zod';

// Schema for the frontend form
export const InterviewPrepFormSchema = z.object({
  jobRole: z.string().min(3, 'Job role must be at least 3 characters.'),
  jobDescription: z.string().optional(),
});

export type InterviewPrepFormValues = z.infer<typeof InterviewPrepFormSchema>;

// Schema for messages in the conversation
export const InterviewMessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});
export type InterviewMessage = z.infer<typeof InterviewMessageSchema>;


// Schema for the AI flow input
export const ConductInterviewInputSchema = z.object({
  jobRole: z.string().describe('The job role the user is practicing for.'),
  jobDescription: z.string().optional().describe('The full job description for context.'),
  history: z.array(InterviewMessageSchema).describe("The history of the conversation so far."),
});
export type ConductInterviewInput = z.infer<typeof ConductInterviewInputSchema>;

// Schema for the AI flow output
export const ConductInterviewOutputSchema = z.object({
  response: z.string().describe("The AI interviewer's response, which should be the next question or feedback."),
  isInterviewOver: z.boolean().default(false).describe("A flag to indicate if the interview has concluded."),
});
export type ConductInterviewOutput = z.infer<typeof ConductInterviewOutputSchema>;
