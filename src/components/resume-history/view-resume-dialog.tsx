'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '../ui/button';
import type { SavedResume } from '@/types';

interface ViewResumeDialogProps {
  resume: SavedResume | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewResumeDialog({ resume, isOpen, onClose }: ViewResumeDialogProps) {
  if (!resume) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{resume.name}</DialogTitle>
          <DialogDescription>
            Review the tailored resume and the original job description.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="flex flex-col gap-2 min-h-0">
            <h3 className="font-semibold">Original Job Description</h3>
            <ScrollArea className="flex-1 min-h-0 rounded-md border p-4 bg-muted/30">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                {resume.jobDescription}
              </pre>
            </ScrollArea>
          </div>

          <div className="flex flex-col gap-2 min-h-0">
            <h3 className="font-semibold">Tailored Resume</h3>
            <ScrollArea className="flex-1 min-h-0 rounded-md border p-4 bg-muted/30">
              <pre className="text-sm whitespace-pre-wrap font-sans">
                {resume.tailoredResume}
              </pre>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
