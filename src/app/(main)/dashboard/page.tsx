// Enable client-side rendering for interactive components
'use client';

// React hooks for state management
import { useState, useMemo } from 'react';

// Core job tracking components
import { KanbanBoard } from '@/components/job-tracker/kanban-board';
import { useJobStore } from '@/hooks/use-job-store';
import { AddJobDialog } from '@/components/job-tracker/add-job-dialog';
import { Progress } from '@/components/job-tracker/progress';
import { Skeleton } from '@/components/ui/skeleton';

// Authentication and UI components
import { useAuth } from '@/app/(main)/auth-provider';
import { Search } from "lucide-react";

/**
 * Job Tracker Dashboard Page
 * 
 * Main dashboard component for managing job applications.
 * Features:
 * - Kanban board visualization of application stages
 * - Real-time job tracking with drag-and-drop
 * - Search and filter functionality
 * - Success rate analytics
 * - Add/Edit/Delete job operations
 */
export default function JobTrackerPage() {
  // Authentication state - get current user
  const { user } = useAuth();
  
  // Job store hook - manages job state and operations
  // Jobs are scoped to the current user via user.id
  const { 
    jobs,           // Array of job objects
    addJob,         // Function to add new job
    updateJobStatus, // Function to update job status (drag-and-drop)
    deleteJob,      // Function to delete job
    isLoaded,       // Boolean indicating if data is loaded
    updateJob       // Function to update job details
  } = useJobStore(user?.id); // Pass user ID to scope data

  // Local state for search functionality
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Filters jobs based on search query matching title or company name
   * Recomputes only when jobs or searchQuery changes
   */
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
            {/* Success Rate Calculation */}
            <span className="text-2xl font-bold text-primary">
              {(() => {
                // Calculate total completed applications (Offers + Rejected)
                const totalCompleted = jobs.filter(
                  (job) => job.status === "Offers" || job.status === "Rejected"
                ).length;
                
                // Calculate success rate: Offers / (Offers + Rejected) * 100
                return totalCompleted > 0
                  ? `${Math.round(
                      (jobs.filter((job) => job.status === "Offers").length /
                        totalCompleted) *
                        100
                    )}%`
                  : "0%"; // Default when no completed applications
              })()}
            </span>
            <span className="text-sm text-muted-foreground">Success Rate</span>
          </div>

          {/* Search Input */}
          <div className="relative group flex-1">
            {/* Search Icon */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            
            {/* Search Input Field */}
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 h-10 text-base rounded border border-gray-300 focus:outline-none focus:border-primary focus:ring-0 placeholder:text-muted-foreground transition-colors"
              aria-label="Search jobs by title or company"
            />
          </div>

          {/* Add Job Button/Dialog */}
          <AddJobDialog onAddJob={addJob} />
        </div>
      </div>

      {/* Main Content Area */}
      {/* Conditional rendering: Show Kanban board when loaded, show skeleton while loading */}
      {isLoaded ? (
        // Kanban Board Component - Main interactive job tracking interface
        <KanbanBoard
          jobs={filteredJobs}           // Pass filtered jobs to board
          updateJobStatus={updateJobStatus} // Function to handle status updates
          deleteJob={deleteJob}          // Function to handle job deletion
          updateJob={updateJob}          // Function to handle job updates
        />
      ) : (
        // Loading State - Display skeleton placeholders
        <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-3">
          {/* Three column skeleton matching Kanban board layout */}
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      )}
    </div>
  );
}

