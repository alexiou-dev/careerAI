'use client';

import { useState, useMemo } from 'react';
import { KanbanBoard } from '@/components/job-tracker/kanban-board';
import { useJobStore } from '@/hooks/use-job-store';
import { AddJobDialog } from '@/components/job-tracker/add-job-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/(main)/auth-provider';

export default function JobTrackerPage() {
  const { user } = useAuth();
  const { jobs, addJob, updateJobStatus, deleteJob, isLoaded } = useJobStore(user?.id);

  const [searchQuery, setSearchQuery] = useState('');

  // Filter jobs based on search input
  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [jobs, searchQuery]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Track your job applications</h1>
          <p className="text-muted-foreground">
            Manage your job applications with ease. Drag and drop cards to update status.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded p-2 md:mr-2"
          />
          <AddJobDialog onAddJob={addJob} />
        </div>
      </div>

      {isLoaded ? (
        <KanbanBoard
          jobs={filteredJobs}
          updateJobStatus={updateJobStatus}
          deleteJob={deleteJob}
        />
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


