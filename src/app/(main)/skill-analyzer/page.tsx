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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Sparkles, Loader2, Upload, Lightbulb } from 'lucide-react';
import { analyzeSkills, type SkillAnalysis } from '@/ai/flows/analyze-skills';
import { useToast } from '@/hooks/use-toast';
import {
    SkillAnalyzerFormSchema,
    type SkillAnalyzerFormValues,
} from '@/types/ai-skills';
import { Skeleton } from '@/components/ui/skeleton';
import { ClickableRecommendation } from '@/components/ui/clickable-recommendation';


const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
        resolve(event.target?.result as string);
        };
        reader.onerror = (error) => {
        reject(error);
        };
        reader.readAsDataURL(file);
    });
};


export default function SkillAnalyzerPage() {
  const [analysisResult, setAnalysisResult] = useState<SkillAnalysis[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  const form = useForm<SkillAnalyzerFormValues>({
    resolver: zodResolver(SkillAnalyzerFormSchema),
  });

  const fileRef = form.register('resume');

  async function onSubmit(values: SkillAnalyzerFormValues) {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const file = values.resume[0];
      const resumePdfDataUri = await fileToDataUri(file);
      const result = await analyzeSkills({
        resumePdfDataUri,
        jobDescription: values.jobDescription,
      });
      setAnalysisResult(result.analysis);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Analyzing Skills',
        description: 'Something went wrong. Please check your inputs and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analyzer</CardTitle>
          <CardDescription>
            Analyze a job description against your resume to find skill gaps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Resume (PDF)</FormLabel>
                    <FormControl>
                      <div>
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
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full job description here..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze Skills
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>
              Missing skills and learning suggestions will appear here.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          {isLoading && (
            <div className='space-y-4'>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
          )}
          {analysisResult && analysisResult.length > 0 && (
            <ul className='space-y-4'>
                {analysisResult.map((item, index) => (
                    <li key={index} className='p-4 rounded-md border bg-muted/50'>
                        <p className='font-semibold text-primary'>{item.skill}</p>
                        <ClickableRecommendation text={item.recommendation} />
                    </li>
                ))}
            </ul>
          )}
           {analysisResult && analysisResult.length === 0 && !isLoading && (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
                <Lightbulb className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                    No significant skill gaps found!
                </p>
                 <p className="mt-2 text-sm text-muted-foreground">
                    Your resume seems to be a great match for this role.
                </p>
              </div>
           )}
          {!isLoading && !analysisResult && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
              <Lightbulb className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Your analysis will be shown here once generated.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
