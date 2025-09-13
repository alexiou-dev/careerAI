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

export type UserCredentials = {
  email: string;
  password?: string;
};


export interface SavedResume {
  id: string;
  title: string;
  name: string;
  tailoredResume: string;
  jobDescription: string;
  createdAt: number;
}
