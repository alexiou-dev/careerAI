'use client';


import { useState, useEffect } from 'react';
import { useResumeStore } from '@/hooks/use-resume-store';
import { useAuth } from '@/app/(main)/auth-provider';
// UI Components
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// Icons for visual elements
import { FileText, Trash2, Pencil, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Date formatting utility
import { format } from 'date-fns';
// Dialog components for modals
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
// Type definitions
import { SavedResume } from '@/types';
// Custom dialog components for resume management
import { RenameResumeDialog } from '@/components/resume-history/rename-resume-dialog';
import { ViewResumeDialog } from '@/components/resume-history/view-resume-dialog';

/**
 * Resume History Page Component 
 * Displays and manages user's saved tailored resumes.
 * Features:
 * - List view of all saved resumes with metadata
 * - View, rename and delete functionality for each resume
 * - Confirmation dialogs for destructive actions
 */
export default function ResumeHistoryPage() {
  // Authentication - get current user
  const { user } = useAuth();
  
  // Resume store for managing saved resumes
  const { 
    resumes,        // Array of saved resume objects
    deleteResume,   // Function to delete a resume
    renameResume,   // Function to rename a resume
    isLoaded        // Boolean indicating if data is loaded
  } = useResumeStore(user?.id); // Scoped to current user

  // State management for dialogs
  const [renameTarget, setRenameTarget] = useState<SavedResume | null>(null);
  const [viewTarget, setViewTarget] = useState<SavedResume | null>(null);

  /**
   * LOADING STATE
   */
  if (!isLoaded) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="space-y-2">
          {/* Title skeleton */}
          <Skeleton className="h-8 w-1/4" />
          {/* Description skeleton */}
          <Skeleton className="h-4 w-1/2" />
        </div>
        {/* Content skeleton */}
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* Resume item skeletons */}
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
        {/* Page title */}
        <h1 className="text-2xl font-bold tracking-tight">Review your resumes</h1>
        {/* Page description */}
        <p className="text-muted-foreground">
          View and manage your previously generated tailored resumes.
        </p>
      </div>

      
      <Card className="mt-6">
        <CardContent className="p-6">
          
          {resumes.length > 0 ? (
         
            <ul className="space-y-3">
              {/* MAP THROUGH EACH SAVED RESUME*/}
              {resumes.map((resume) => (
                <li 
                  key={resume.id} 
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  {/* LEFT SIDE: RESUME INFORMATION */}
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    {/* RESUME ICON */}
                    <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    
                    {/* RESUME DETAILS CONTAINER */}
                    <div className="flex-1 overflow-hidden">
                      {/* RESUME NAME*/}
                      <p className="font-semibold truncate">{resume.name}</p>
                      
                      {/* CREATION DATE */}
                      <p className="text-sm text-muted-foreground">
                        Generated on {format(new Date(resume.createdAt), "MMMM do, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT SIDE: ACTION BUTTONS */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* VIEW BUTTON */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setViewTarget(resume)}
                      aria-label={`View resume: ${resume.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* RENAME BUTTON */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setRenameTarget(resume)}
                      aria-label={`Rename resume: ${resume.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* 
                      DELETE BUTTON WITH CONFIRMATION DIALOG
                      - AlertDialog: Confirmation modal before deletion
                      - Trigger: Button that opens the dialog
                      - Content: Dialog content with actions
                    */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Delete resume: ${resume.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>

                      {/* 
                        ALERT DIALOG CONTENT
                        - Modal overlay with confirmation message
                        - Prevents accidental deletions
                      */}
                      <AlertDialogContent>
                        {/* Dialog header with title and description */}
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this resume.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        {/* Dialog footer with action buttons */}
                        <AlertDialogFooter>
                          {/* Cancel button - closes dialog without action */}
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          
                          {/* 
                            DELETE ACTION BUTTON
                            - onClick executes deleteResume with resume ID
                          */}
                          <AlertDialogAction
                            onClick={() => deleteResume(resume.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
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
              {/* Empty state icon */}
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                You have no saved resumes.
              </p>
              <p className="text-xs text-muted-foreground">
                Tailored resumes will appear here after you save them.
              </p>
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
        onClose={() => setViewTarget(null)}/>
    </>
  );
}    
