'use client';
import { useState } from 'react';
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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus } from 'lucide-react';
import type { Job, JobStatus } from '@/types';

const formSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  status: z.enum(['Applied', 'Interviewing', 'Rejected', 'Offers']),
  reminderDate: z.number().optional(), // timestamp
});

type AddJobFormValues = z.infer<typeof formSchema>;

interface AddJobDialogProps {
  onAddJob: (job: Omit<Job, 'id' | 'createdAt'>) => void;
}

export function AddJobDialog({ onAddJob }: AddJobDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<AddJobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      company: '',
      url: '',
      description: '',
      status: 'Applied',
      reminderDate: undefined,
    },
  });

  function onSubmit(values: AddJobFormValues) {
    // Default reminder if status is Interviewing but no date chosen
    let reminderDate = values.reminderDate;
    if (values.status === 'Interviewing' && !reminderDate) {
      reminderDate = Date.now() + 7 * 24 * 60 * 60 * 1000; // +7 days
    }

    onAddJob({
      ...values,
      reminderDate,
    });

    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Job Application</DialogTitle>
          <DialogDescription>
            Enter the details of the job you've applied for.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Google" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Posting URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional: a brief description of the role" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border rounded p-2 w-full"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Offers">Offers</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reminder — only if Interviewing */}
            {form.watch('status') === 'Interviewing' && (
              <FormField
                control={form.control}
                name="reminderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value).getTime())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Add Job
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

