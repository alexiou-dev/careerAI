'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Sparkles, Loader2, Plus, Check, ExternalLink } from 'lucide-react';
import { findRelevantJobPostings, JobPosting } from '@/ai/flows/ai-job-finder';
import { useJobStore } from '@/hooks/use-job-store';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  jobRole: z.string().min(2, 'Job role must be at least 2 characters.'),
  preferences: z.string().optional(),
});

type JobFinderFormValues = z.infer<typeof formSchema>;

export default function JobFinderPage() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedJobs, setAddedJobs] = useState<Set<string>>(new Set());
  const { addJob } = useJobStore();
  const { toast } = useToast();

  const form = useForm<JobFinderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobRole: '',
      preferences: '',
    },
  });

  async function onSubmit(values: JobFinderFormValues) {
    setIsLoading(true);
    setJobPostings([]);
    try {
      const result = await findRelevantJobPostings(values);
      setJobPostings(result.jobPostings);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error finding jobs',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddJob = (posting: JobPosting) => {
    // A simple parser for "Title at Company"
    const atSeparator = ' at ';
    const parts = posting.title.split(atSeparator);
    const title = parts.length > 1 ? parts.slice(0, -1).join(atSeparator) : posting.title;
    const company = parts.length > 1 ? parts[parts.length - 1] : 'N/A';
    
    addJob({ title, company, url: posting.url });
    setAddedJobs(prev => new Set(prev).add(posting.url));
    toast({
      title: 'Job Added',
      description: `"${posting.title}" has been added to your Job Tracker.`,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Search for Jobs</CardTitle>
          <CardDescription>
            Enter your desired role and any preferences to start your search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="jobRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Frontend Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferences (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Remote, in San Francisco, >$150k" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Find Jobs
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-3/4 rounded bg-muted"></div>
                <div className="h-4 w-1/2 rounded bg-muted mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 w-full rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {jobPostings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Found Jobs</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobPostings.map((posting, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader className="flex-grow">
                  <a href={posting.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    <CardTitle className="text-lg flex items-center gap-2">
                        {posting.title}
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </a>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={addedJobs.has(posting.url) ? "outline" : "default"}
                    onClick={() => handleAddJob(posting)}
                    disabled={addedJobs.has(posting.url)}
                    className="w-full"
                  >
                    {addedJobs.has(posting.url) ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {addedJobs.has(posting.url) ? 'Added' : 'Add to Tracker'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
