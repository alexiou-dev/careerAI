export type JobStatus = 'Applied' | 'Interviewing' | 'Rejected' | 'Accepted';

export interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  url?: string;
  description?: string;
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // In a real app, never store plain text passwords
}

export interface Resume {
    id: string;
    title: string;
    content: string;
    originalResume: string;
    jobDescription: string;
    createdAt: number;
}

export interface SavedResume {
  id: string;
  name: string;
  tailoredResume: string;
  jobDescription: string;
  createdAt: number;
}
