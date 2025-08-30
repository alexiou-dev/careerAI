'use client';
import type { DragEvent } from 'react';
import type { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface JobCardProps {
  job: Job;
  onDelete: (jobId: string) => void;
}

export function JobCard({ job, onDelete }: JobCardProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('jobId', job.id);
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing bg-card hover:shadow-md transition-shadow"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
            <div className='pr-2'>
              <CardTitle className="text-base font-medium">{job.title}</CardTitle>
              <CardDescription className="pt-1">{job.company}</CardDescription>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                {job.url && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={job.url} target="_blank" rel="noopener noreferrer" aria-label="View job posting">
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" aria-label="Delete job">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this job application.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(job.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </CardHeader>
      {job.description && (
        <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        </CardContent>
      )}
    </Card>
  );
}

