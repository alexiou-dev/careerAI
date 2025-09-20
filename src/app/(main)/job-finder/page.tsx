'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl as FormUiControl, FormMessage } from '@/components/ui/form';
import { Sparkles, Loader2, Plus, Check, Upload, X } from 'lucide-react';
import { findRelevantJobPostings, JobPosting } from '@/ai/flows/ai-job-finder';
import { useJobStore } from '@/hooks/use-job-store';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/(main)/auth-provider';
import { MapPin, Briefcase, Clock, DollarSign } from "lucide-react";

const formSchema = z.object({
  jobRole: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  workStyle: z.enum(['any', 'remote', 'hybrid']).default('any'),
  other: z.string().optional(),
  major: z.string().optional(),
  resume: z.any().optional(),
}).refine(data => data.jobRole || data.major, {
  message: 'Either Job Role or Major is required',
  path: ['jobRole'],
});

type JobFinderFormValues = z.infer<typeof formSchema>;

function calculateMatch(posting: JobPosting, userInput: JobFinderFormValues): number {
  const keywords = [
    ...(userInput.jobRole?.split(' ') || []),
    ...(userInput.other?.split(' ') || []),
    ...(userInput.major?.split(' ') || []),
  ].map(k => k.toLowerCase());

  const text = ((posting.title ?? '') + ' ' + (posting.description ?? '')).toLowerCase();
  if (!keywords.length) return 0;

  const matches = keywords.filter(k => text.includes(k));
  return Math.min(100, Math.round((matches.length / keywords.length) * 100));
}

export default function JobFinderPage() {
  const { user } = useAuth();
  const { addJob } = useJobStore(user?.id);
  const { toast } = useToast();

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedJobs, setAddedJobs] = useState<Set<string>>(new Set());
  const [fileName, setFileName] = useState('');
  const [sortBy, setSortBy] = useState<'bestMatch' | 'mostRecent' | 'highestSalary' | ''>('');

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

  const normalizeUrl = (url?: string) => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      parsed.search = '';
      return parsed.toString();
    } catch {
      return url;
    }
  };

  const onSubmit = async (values: JobFinderFormValues) => {
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
      setJobPostings(Array.from(uniqueByTitle.values()));
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
  };

  const handleAddJob = (posting: JobPosting) => {
    addJob({ title: posting.title, company: posting.company || 'N/A', url: posting.url });
    setAddedJobs(prev => new Set(prev).add(posting.url));
    toast({ title: 'Job Added', description: `"${posting.title}" has been added to your Job Tracker.` });
    setJobPostings(prev => prev.filter(p => normalizeUrl(p.url) !== normalizeUrl(posting.url)));
  };

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    form.setValue('resume', null);
    setFileName('');
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Sort job postings
  const sortedJobPostings = [...jobPostings].sort((a, b) => {
    if (sortBy === 'bestMatch') return (b.matchPercentage ?? calculateMatch(b, form.getValues())) - (a.matchPercentage ?? calculateMatch(a, form.getValues()));
    if (sortBy === 'mostRecent') return new Date(b.postedAt ?? '').getTime() - new Date(a.postedAt ?? '').getTime();
    if (sortBy === 'highestSalary') {
      const parseSalary = (s?: string) => {
        if (!s) return 0;
        const matches = s.match(/\$([\d,]+)/g);
        if (!matches) return 0;
        return Math.max(...matches.map(m => Number(m.replace(/\$|,/g, ''))));
      };
      return parseSalary(b.salary) - parseSalary(a.salary);
    }
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search for Jobs</CardTitle>
          <CardDescription>Enter your desired role or field of study and filters to start your search.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Job Role & Major */}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="jobRole" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Role</FormLabel>
                    <FormUiControl>
                      <Input {...field} placeholder="e.g., Frontend Developer" />
                    </FormUiControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="major" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Major / Field of Study</FormLabel>
                    <FormUiControl>
                      <Input {...field} placeholder="e.g., Economics, Computer Science" />
                    </FormUiControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Filters */}
              <div className="grid md:grid-cols-3 gap-4">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormUiControl>
                      <Input {...field} placeholder="e.g., London, UK" />
                    </FormUiControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="salary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary</FormLabel>
                    <FormUiControl>
                      <Input type="number" {...field} placeholder="e.g., 50000" />
                    </FormUiControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="workStyle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      
                        <SelectTrigger>
                          <SelectValue placeholder="Select work style" />
                        </SelectTrigger>
                 
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
                  <FormUiControl>
                    <Textarea {...field} placeholder="e.g., specific technologies, internship, part-time..." />
                  </FormUiControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Resume Upload */}
              <FormField control={form.control} name="resume" render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload CV (PDF)</FormLabel>
                  <FormUiControl>
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
                        className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        <Upload className="h-4 w-4" />
                        <span className='truncate'>{fileName || 'Choose a PDF file'}</span>
                      </label>
                      {fileName && (
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8" onClick={handleRemoveFile}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormUiControl>
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

{/* Sort & Results */}
{jobPostings.length > 0 && (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Found Jobs</h2>
      <Select
        value={sortBy}
        onValueChange={(value) =>
          setSortBy(value as 'bestMatch' | 'mostRecent' | 'highestSalary')
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bestMatch">Best Match</SelectItem>
          <SelectItem value="mostRecent">Most Recent</SelectItem>
          <SelectItem value="highestSalary">Highest Salary</SelectItem>
        </SelectContent>
      </Select>
    </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedJobPostings.map((posting) => {
              const match = posting.matchPercentage ?? calculateMatch(posting, form.getValues());
              let matchColor = "bg-gray-200 text-gray-700";
              if (match > 90) matchColor = "bg-green-100 text-green-700";
              else if (match >= 80) matchColor = "bg-yellow-100 text-yellow-700";

              return (
                <Card key={posting.url} className="flex flex-col p-4 relative">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <a href={posting.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                        {posting.title}
                      </a>
                    </h3>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{posting.company}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{posting.location}</span>
                    </div>
                    {posting.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{posting.salary}</span>
                      </div>
                    )}
                    {posting.postedAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(posting.postedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                    {posting.description?.split('. ')[0] + '.'}
                  </p>

                  <div className="flex justify-between items-center mt-3">
                    {posting.remote && (
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                        Remote OK
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${matchColor}`}>
                      {match}% match
                    </span>
                  </div>

                  <Button
                    variant={addedJobs.has(posting.url) ? "outline" : "default"}
                    onClick={() => handleAddJob(posting)}
                    disabled={addedJobs.has(posting.url)}
                    className="w-full mt-4"
                  >
                    {addedJobs.has(posting.url) ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {addedJobs.has(posting.url) ? "Added" : "Add to Tracker"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

