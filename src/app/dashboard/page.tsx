'use client';

import { KanbanBoard } from '@/components/job-tracker/kanban-board';
import { useJobStore } from '@/hooks/use-job-store';
import { AddJobDialog } from '@/components/job-tracker/add-job-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobTrackerPage() {
  const { jobs, addJob, updateJobStatus, deleteJob, isLoaded } = useJobStore();

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Application Tracker</h1>
          <p className="text-muted-foreground">
            Manage your job applications with ease. Drag and drop cards to update status.
          </p>
        </div>
        <AddJobDialog onAddJob={addJob} />
      </div>
      {isLoaded ? (
        <KanbanBoard jobs={jobs} updateJobStatus={updateJobStatus} deleteJob={deleteJob} />
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      )}
    </div>
  );
}

