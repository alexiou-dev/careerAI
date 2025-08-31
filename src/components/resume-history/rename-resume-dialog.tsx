'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Resume } from '@/types';

const formSchema = z.object({
  title: z.string().min(1, 'Resume title is required'),
});

type RenameResumeFormValues = z.infer<typeof formSchema>;

interface RenameResumeDialogProps {
  resume: Resume | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (id: string, newTitle: string) => void;
}

export function RenameResumeDialog({ resume, isOpen, onClose, onRename }: RenameResumeDialogProps) {
  const form = useForm<RenameResumeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  useEffect(() => {
    if (resume) {
      form.reset({ title: resume.title });
    }
  }, [resume, form]);

  function onSubmit(values: RenameResumeFormValues) {
    if (resume) {
      onRename(resume.id, values.title);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Resume</DialogTitle>
          <DialogDescription>
            Give your tailored resume a new name.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
