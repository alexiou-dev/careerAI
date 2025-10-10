import {z} from 'zod';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = ['application/pdf'];

// Schema for the frontend form on the Skill Analyzer page
export const SkillAnalyzerFormSchema = z.object({
  resume: z
    .any()
    .refine((files) => files?.length === 1, 'Resume is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf files are accepted.'
    ),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
});

export type SkillAnalyzerFormValues = z.infer<typeof SkillAnalyzerFormSchema>;

// Schema for the AI flow input
export const AnalyzeSkillsInputSchema = z.object({
  resumePdfDataUri: z
    .string()
    .describe(
      "The user's resume in PDF format, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  jobDescription: z.string().describe('The job description to analyze against the resume.'),
});
export type AnalyzeSkillsInput = z.infer<typeof AnalyzeSkillsInputSchema>;

// Schema for the AI flow output
const SkillGapSchema = z.object({
    skill: z.string().describe("The skill that is missing from the user's resume."),
    roadmap: z.array(z.string()).describe("A step-by-step learning plan to acquire the missing skill."),
});

export const AnalyzeSkillsOutputSchema = z.object({
  skillGaps: z.array(SkillGapSchema).describe("A list of identified skill gaps and their corresponding learning roadmaps."),
  message: z.string().optional().describe("A message to be displayed if no significant skill gaps are found."),
});

export type SkillAnalysis = z.infer<typeof AnalyzeSkillsOutputSchema>;

export type StoredRoadmap = {
  id: string;
  name: string;
  createdAt: string;
  analysis: SkillAnalysis;
  jobDescription: string;
  priority?: 'high' | 'medium' | 'low';
  timeline?: string;
};

