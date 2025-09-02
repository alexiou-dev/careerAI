'use client';

import { useState } from 'react';
import { useResumeStore } from '@/hooks/use-resume-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Trash2, Pencil, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
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
import { SavedResume } from '@/types';
import { RenameResumeDialog } from '@/components/resume-history/rename-resume-dialog';
import { ViewResumeDialog } from '@/components/resume-history/view-resume-dialog';

export default function ResumeHistoryPage() {
  const { resumes, deleteResume, renameResume, isLoaded } = useResumeStore();
  const [renameTarget, setRenameTarget] = useState<SavedResume | null>(null);
  const [viewTarget, setViewTarget] = useState<SavedResume | null>(null);

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
       <div>
          <h1 className="text-2xl font-bold tracking-tight">Review your resumes</h1>
          <p className="text-muted-foreground">
            View and manage your previously generated tailored resumes.
          </p>
        </div>
      <Card className="mt-6">
        <CardContent className="p-6">
          {resumes.length > 0 ? (
            <ul className="space-y-3">
              {resumes.map((resume) => (
                <li key={resume.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                   <div className="flex items-center gap-4 flex-1 overflow-hidden">
                     <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                     <div className="flex-1 overflow-hidden">
                       <p className="font-semibold truncate">{resume.name}</p>
                       <p className="text-sm text-muted-foreground">
                         Generated on {format(new Date(resume.createdAt), "MMMM do, yyyy h:mm a")}
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center gap-1 flex-shrink-0">
                     <Button variant="ghost" size="icon" onClick={() => setViewTarget(resume)} aria-label="View resume">
                       <Eye className="h-4 w-4" />
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => setRenameTarget(resume)} aria-label="Rename resume">
                        <Pencil className="h-4 w-4" />
                     </Button>
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" aria-label="Delete resume">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                           <AlertDialogDescription>
                             This action cannot be undone. This will permanently delete this resume.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={() => deleteResume(resume.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                             Delete
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                   </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">You have no saved resumes.</p>
              <p className="text-xs text-muted-foreground">Tailored resumes will appear here after you save them.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <RenameResumeDialog
        resume={renameTarget}
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        onRename={(id, newName) => {
          renameResume(id, newName);
          setRenameTarget(null);
        }}
      />
      
      <ViewResumeDialog
        resume={viewTarget}
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </>
  );
}
