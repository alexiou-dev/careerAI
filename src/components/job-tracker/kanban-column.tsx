'use client';

import type { DragEvent } from 'react';
import type { Job, JobStatus } from '@/types';
import { JobCard } from './job-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FileClock, MessageSquare, XCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface KanbanColumnProps {
  status: JobStatus;
  jobs: Job[];
  updateJobStatus: (jobId: string, newStatus: JobStatus) => void;
  deleteJob: (jobId: string) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
}

const statusConfig = {
  Applied: { icon: FileClock, color: 'text-blue-500' },
  Interviewing: { icon: MessageSquare, color: 'text-yellow-500' },
  Rejected: { icon: XCircle, color: 'text-red-500' },
  Offers: { icon: CheckCircle2, color: 'text-green-500' },
};

export function KanbanColumn({ status, jobs, updateJobStatus, deleteJob, updateJob }: KanbanColumnProps) 
{
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const Icon = statusConfig[status].icon;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggedOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggedOver(false);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (jobId) {
      const droppedJob = jobs.find(job => job.id === jobId);
      if (!droppedJob) { // Only update if it's from another column
        updateJobStatus(jobId, status);
      }
    }
    setIsDraggedOver(false);
  };

  return (
    <Card
      className={cn(
        'flex h-full flex-col',
        isDraggedOver && 'bg-accent'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", statusConfig[status].color)} />
          <CardTitle className="text-lg font-semibold">{status}</CardTitle>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
          {jobs.length}
        </span>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-22rem)]">
          <div className="p-4 space-y-4">
            {jobs.length > 0 ? (
              jobs.map((job) => <JobCard key={job.id} job={job} onDelete={deleteJob} onUpdate={updateJob}/>)
            ) : (
              <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
                Drag jobs here
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

