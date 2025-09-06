'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Sparkles, Loader2, Plus, Check, ExternalLink } from 'lucide-react';
import { findRelevantJobPostings, JobPosting } from '@/ai/flows/ai-job-finder';
import { useJobStore } from '@/hooks/use-job-store';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  jobRole: z.string().min(2, 'Job role must be at least 2 characters.'),
  location: z.string().optional(),
  minWage: z.string().optional(),
  workStyle: z.enum(['any', 'remote', 'hybrid']).default('any'),
  other: z.string().optional(),
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
    defaultValues: { jobRole: '', location: '', minWage: '', workStyle: 'any', other: '' },
  });

  async function onSubmit(values: JobFinderFormValues) {
    setIsLoading(true);
    setJobPostings([]);
    try {
      const input = {
        jobRole: values.jobRole,
        location: values.location,
        minWage: values.minWage ? parseInt(values.minWage, 10) : undefined,
        workStyle: values.workStyle,
        other: values.other,
      };
      const result = await findRelevantJobPostings(input);
      setJobPostings(result.jobPostings);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error finding jobs', description: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddJob = (posting: JobPosting) => {
    const [title, company] = posting.title.split(' at ');
    addJob({ title, company: company || 'N/A', url: posting.url });
    setAddedJobs(prev => new Set(prev).add(posting.url));
    toast({ title: 'Job Added', description: `"${posting.title}" has been added to your Job Tracker.` });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Search for Jobs</CardTitle>
          <CardDescription>Enter your desired role and filters to start your search.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="jobRole" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Role</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g., Frontend Developer" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <div className="grid md:grid-cols-3 gap-4">
                     <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., London, UK" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="minWage"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Minimum Salary</FormLabel>
                            <FormControl>
                               <Input type="number" placeholder="e.g., 50000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="workStyle"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Work Style</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select work style" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="any">Any</SelectItem>
                                    <SelectItem value="remote">Remote</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
              <FormField control={form.control} name="other" render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Preferences</FormLabel>
                  <FormControl><Textarea {...field} placeholder="e.g., specific technologies, company size..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Find Jobs
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {jobPostings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Found Jobs</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobPostings.map((posting, i) => (
              <Card key={i} className="flex flex-col">
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
                    variant={addedJobs.has(posting.url) ? 'outline' : 'default'}
                    onClick={() => handleAddJob(posting)}
                    disabled={addedJobs.has(posting.url)}
                    className="w-full"
                  >
                    {addedJobs.has(posting.url) ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
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

