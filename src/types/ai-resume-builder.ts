
import { z } from 'zod';

const WorkExperienceSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  responsibilities: z.string().min(1, 'Responsibilities are required').describe('A newline-separated list of responsibilities. Each line should start with a bullet point.'),
});

const EducationSchema = z.object({
  school: z.string().min(1, 'School name is required'),
  location: z.string().min(1, 'Location is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

const LeadershipSchema = z.object({
    organization: z.string().min(1, 'Organization/Project is required'),
    role: z.string().optional(),
    description: z.string().min(1, 'Description is required').describe('A newline-separated list of activities. Each line should start with a bullet point.'),
});


export const ResumeBuilderFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(1, 'Phone number is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  linkedin: z.string().url('Please enter a valid URL or leave empty.').optional().or(z.literal('')),
  github: z.string().url('Please enter a valid URL or leave empty.').optional().or(z.literal('')),
  portfolio: z.string().url('Please enter a valid URL or leave empty.').optional().or(z.literal('')),
  summary: z.string().min(50, 'Summary must be at least 50 characters'),
  workExperience: z.array(WorkExperienceSchema).min(1, 'At least one work experience is required'),
  education: z.array(EducationSchema).min(1, 'At least one education entry is required'),
  leadership: z.array(LeadershipSchema).optional(),
  technicalSkills: z.string().min(1, 'Technical skills are required'),
  programmingSkills: z.string().optional(),
  languages: z.string().min(1, 'Languages are required'),
});

export type ResumeBuilderFormValues = z.infer<typeof ResumeBuilderFormSchema>;

export const GenerateResumeInputSchema = ResumeBuilderFormSchema;
export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

export const GenerateResumeOutputSchema = z.object({
  generatedResume: z.string().describe('The full resume formatted as plain text.'),
});
export type GenerateResumeOutput = z.infer<typeof GenerateResumeOutputSchema>;
