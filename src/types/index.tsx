export type JobStatus = 'Applied' | 'Interviewing' | 'Rejected' | 'Offers';

export interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  url?: string;
  description?: string;
  createdAt: number;
  reminderDate?: number; 
}

export interface JobPosting {
  url: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  postedAt?: string; // e.g. "2 hours ago"
  description?: string;
  skills?: string[]; // ["React", "TypeScript", "Node.js", "AWS"]
  logoUrl?: string;
  matchPercentage?: number; // 0–100
  remote?: boolean;
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
