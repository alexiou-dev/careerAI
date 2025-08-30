import type { Job, JobStatus } from '@/types';
import { KanbanColumn } from './kanban-column';

const statuses: JobStatus[] = ['Applied', 'Interviewing', 'Rejected'];

interface KanbanBoardProps {
  jobs: Job[];
  updateJobStatus: (jobId: string, newStatus: JobStatus) => void;
  deleteJob: (jobId: string) => void;
}

export function KanbanBoard({ jobs, updateJobStatus, deleteJob }: KanbanBoardProps) {
  return (
    <div className="grid flex-1 grid-cols-1 items-start gap-6 md:grid-cols-3">
      {statuses.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          jobs={jobs.filter((job) => job.status === status).sort((a, b) => b.createdAt - a.createdAt)}
          updateJobStatus={updateJobStatus}
          deleteJob={deleteJob}
        />
      ))}
    </div>
  );
}
