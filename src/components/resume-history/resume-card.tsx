'use client';

import type { Resume } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Eye } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '../ui/textarea';

interface ResumeCardProps {
  resume: Resume;
  onRename: () => void;
  onDelete: () => void;
}

export function ResumeCard({ resume, onRename, onDelete }: ResumeCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-grow pb-4">
        <CardTitle className="text-base font-medium">{resume.title}</CardTitle>
        <CardDescription className="pt-1">
          Created on {new Date(resume.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-end gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{resume.title}</DialogTitle>
              <DialogDescription>
                This is the tailored resume content.
              </DialogDescription>
            </DialogHeader>
            <Textarea readOnly value={resume.content} rows={25} className="bg-muted/40" />
          </DialogContent>
        </Dialog>
        <Button variant="outline" size="sm" onClick={onRename}>
          <Edit className="mr-2 h-4 w-4" /> Rename
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this tailored resume.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
