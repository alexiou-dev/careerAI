'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Mock data for jobs related to a major
const majorJobsData: Record<string, { job: string; salary: number; growth: number }[]> = {
  'Computer Science': [
    { job: 'Software Engineer', salary: 95000, growth: 15 },
    { job: 'Data Scientist', salary: 110000, growth: 20 },
    { job: 'Cybersecurity Analyst', salary: 85000, growth: 18 },
    { job: 'Cloud Architect', salary: 120000, growth: 22 },
    { job: 'AI/ML Engineer', salary: 115000, growth: 25 },
  ],
  'Electrical Engineering': [
    { job: 'Hardware Engineer', salary: 92000, growth: 10 },
    { job: 'FPGA Designer', salary: 105000, growth: 12 },
    { job: 'Power Systems Engineer', salary: 88000, growth: 8 },
    { job: 'Control Systems Engineer', salary: 85000, growth: 9 },
    { job: 'Telecommunications Engineer', salary: 89000, growth: 11 },
  ],
  'Finance': [
    { job: 'Financial Analyst', salary: 85000, growth: 12 },
    { job: 'Investment Banker', salary: 130000, growth: 15 },
    { job: 'Portfolio Manager', salary: 140000, growth: 14 },
    { job: 'Risk Analyst', salary: 80000, growth: 10 },
    { job: 'Accountant', salary: 75000, growth: 7 },
  ],
};


interface MajorJobsDialogProps {
  major: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorJobsDialog({ major, open, onOpenChange }: MajorJobsDialogProps) {
    const jobs = majorJobsData[major] || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
            <DialogTitle>Top Career Paths for {major}</DialogTitle>
            <DialogDescription>
                Based on current market data, here are the top 5 jobs for this major.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {jobs.length > 0 ? (
                     <ul className="space-y-4">
                        {jobs.map((jobInfo, index) => (
                           <li key={index} className="p-3 rounded-md border bg-muted/50 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{jobInfo.job}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Median Salary: ${jobInfo.salary.toLocaleString()}
                                    </p>
                                </div>
                                <Badge variant={jobInfo.growth > 15 ? "default" : "secondary"}>
                                    {jobInfo.growth}% Growth
                                </Badge>
                           </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-foreground">No specific job data available for this major.</p>
                )}
            </div>
        </DialogContent>
        </Dialog>
  );
}
