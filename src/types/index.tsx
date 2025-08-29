export type JobStatus = 'Applied' | 'Interviewing' | 'Rejected';

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
