'use client';
import { useState, useMemo, } from 'react';
import { KanbanBoard } from '@/components/job-tracker/kanban-board';
import { useJobStore } from '@/hooks/use-job-store';
import { AddJobDialog } from '@/components/job-tracker/add-job-dialog';
import { Progress } from '@/components/job-tracker/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/(main)/auth-provider';
import { Search } from "lucide-react";

export default function JobTrackerPage() {
  const { user } = useAuth();
  const { jobs, addJob, updateJobStatus, deleteJob, isLoaded, updateJob } = useJobStore(user?.id);

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
    {/* Header Section */}
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Title and description */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Track your job applications
        </h1>
        <p className="text-muted-foreground">
          Manage your job applications with ease. Drag and drop cards to update status.
        </p>
      </div>

      {/* Controls: Success Rate, Search, Add Job */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:space-x-4">
        {/* Success Rate Box */}
          <div className="flex flex-col items-center justify-center bg-secondary/10 border-2 border-primary rounded-lg px-6 py-4 min-w-[100px] shadow-sm">
    <span className="text-2xl font-bold text-primary">
      {(() => {
        const totalCompleted = jobs.filter(
          (job) => job.status === "Offers" || job.status === "Rejected"
        ).length;
        return totalCompleted > 0
          ? `${Math.round(
              (jobs.filter((job) => job.status === "Offers").length /
                totalCompleted) *
                100
            )}%`
          : "0%";
      })()}
    </span>
    <span className="text-sm text-muted-foreground">Success Rate</span>
  </div>

  {/* Search Input */}
  <div className="relative group flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
    <input
      type="text"
      placeholder="Search jobs..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-10 h-10 text-base rounded border border-gray-300 focus:outline-none focus:border-primary focus:ring-0 placeholder:text-muted-foreground transition-colors"
    />
  </div>

  {/* Add Job Button */}
  <AddJobDialog onAddJob={addJob} />
      </div>
    </div>

      {isLoaded ? (
        <KanbanBoard
          jobs={filteredJobs}
          updateJobStatus={updateJobStatus}
          deleteJob={deleteJob}
          updateJob={updateJob}  
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



