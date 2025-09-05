import { z } from 'zod';

// Schema for the frontend form on the AI Job Finder page
export const JobFinderFormSchema = z.object({
  jobRole: z.string().min(1, 'Job role is required.'),
  location: z.string().optional(),
  salary: z.string().optional(), // Stored as string, converted to number on submit
  workStyle: z.enum(['any', 'remote', 'hybrid']).default('any'),
  other: z.string().optional(),
  resume: z
    .any()
    .optional(),
});
export type JobFinderFormValues = z.infer<typeof JobFinderFormSchema>;


// Schema for the AI flow input (passed to the backend)
export const FindRelevantJobPostingsInputSchema = z.object({
  jobRole: z.string().describe('The desired job role, e.g., Software Engineer, Data Scientist.'),
  location: z.string().optional().describe('The desired city, state, or country for the job.'),
  salary: z.number().optional().describe('The minimum desired annual salary.'),
  workStyle: z.enum(['any', 'remote', 'hybrid']).optional().describe('The desired work style.'),
  other: z.string().optional().describe('Any other specific preferences for the job, such as technologies or company size.'),
});
export type FindRelevantJobPostingsInput = z.infer<typeof FindRelevantJobPostingsInputSchema>;
