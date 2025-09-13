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
import { Sparkles, Loader2, Plus, Check, ExternalLink, Upload, X } from 'lucide-react';
import { findRelevantJobPostings, JobPosting } from '@/ai/flows/ai-job-finder';
import { useJobStore } from '@/hooks/use-job-store';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/(main)/auth-provider';

const formSchema = z.object({
  jobRole: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  workStyle: z.enum(['any', 'remote', 'hybrid']).default('any'),
  other: z.string().optional(),
  major: z.string().optional(),
  resume: z
    .any()
    .optional(),
}).refine(data => data.jobRole || data.major, {
  message: 'Either Job Role or Major is required',
  path: ['jobRole'],
});

type JobFinderFormValues = z.infer<typeof formSchema>;

export default function JobFinderPage() {
  const { user } = useAuth();
  const { addJob, jobs } = useJobStore(user?.id);


  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedJobs, setAddedJobs] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [fileName, setFileName] = useState('');

  const form = useForm<JobFinderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobRole: '',
      location: '',
      salary: '',
      workStyle: 'any',
      other: '',
      major: '',
      resume: undefined,
    },
  });

  const fileRef = form.register('resume');

  function normalizeUrl(url?: string) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

  async function onSubmit(values: JobFinderFormValues) {
  setIsLoading(true);
  setJobPostings([]);
  try {
    const input = {
      jobRole: (values.jobRole?.trim() || values.major?.trim() || '') as string,
      location: values.location?.trim() || undefined,
      salary: values.salary ? parseInt(values.salary, 10) : undefined,
      workStyle: values.workStyle,
      other: values.other?.trim() || undefined,
      resume: values.resume?.[0] || undefined, 
    };

    const result = await findRelevantJobPostings(input);

 
    const uniqueByTitle = new Map<string, JobPosting>();
    for (const p of result.jobPostings) {
      const titleKey = p.title.trim().toLowerCase(); 
      if (!uniqueByTitle.has(titleKey)) {
        uniqueByTitle.set(titleKey, p);
      }
    }

    const uniquePostings = Array.from(uniqueByTitle.values()); 
    setJobPostings(uniquePostings);
  } catch (error) {
    console.error(error);
    toast({ 
      variant: 'destructive', 
      title: 'Error finding jobs', 
      description: 'Something went wrong. Please try again.' 
    });
  } finally {
    setIsLoading(false);
  }
}


  const handleAddJob = (posting: JobPosting) => {
    const atSeparator = ' at ';
    const parts = posting.title.split(atSeparator);
    const title = parts.length > 1 ? parts.slice(0, -1).join(atSeparator) : posting.title;
    const company = parts.length > 1 ? parts[parts.length - 1] : 'N/A';
    
    addJob({ title, company, url: posting.url });
    setAddedJobs(prev => new Set(prev).add(posting.url));
    toast({ title: 'Job Added', description: `"${posting.title}" has been added to your Job Tracker.` });
    setJobPostings(prev => prev.filter(p => normalizeUrl(p.url) !== normalizeUrl(posting.url)));
  };
  
  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    form.setValue('resume', null);
    setFileName('');
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Search for Jobs</CardTitle>
          <CardDescription>Enter your desired role or field of study and filters to start your search. </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Job Role & Major */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField control={form.control} name="jobRole" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Role</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Frontend Developer" value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="major" render={({ field }) => (
                <FormItem>
                  <FormLabel>Major / Field of Study</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Economics, Computer Science" value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

              {/* Filters Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., London, UK" value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="salary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="e.g., 50000" value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="workStyle" render={({ field }) => (
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
                )} />
              </div>

              {/* Other Preferences */}
              <FormField control={form.control} name="other" render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Preferences</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="e.g., specific technologies, company size..." value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />  

              {/* CV Upload */}
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload CV (PDF)</FormLabel>
                     <FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          {...fileRef}
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            setFileName(e.target.files?.[0]?.name || '');
                          }}
                          id="resume-upload"
                        />
                         <label
                          htmlFor="resume-upload"
                          className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground ring-offset-background cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        >
                          <Upload className="h-4 w-4" />
                          <span className='truncate'>{fileName || 'Choose a PDF file'}</span>
                        </label>
                         {fileName && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Find Jobs
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {jobPostings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Found Jobs</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobPostings.map((posting) => (
              <Card key={posting.url} className="flex flex-col">
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

