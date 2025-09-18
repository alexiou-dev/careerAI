'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Sparkles, Loader2, Upload, Lightbulb, CheckCircle, X } from 'lucide-react';
import { analyzeJobSkills } from '@/ai/flows/analyze-skills';
import { useToast } from '@/hooks/use-toast';
import {
  SkillAnalyzerFormSchema,
  type SkillAnalyzerFormValues,
  type SkillAnalysis,
} from '@/types/ai-skills';

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

export default function SkillAnalyzerPage() {
  const [analysisResult, setAnalysisResult] = useState<SkillAnalysis | null>(null);
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

      const result = await analyzeJobSkills({
        resumePdfDataUri,
        jobDescription: values.jobDescription,
      });
      setAnalysisResult(result);

    } catch (error: any) {
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
    <div className="grid gap-8 md:grid-cols-2">
       <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analyzer</CardTitle>
          <CardDescription>
            Upload your resume and paste a job description to identify the key skills you should focus on to land the role.
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
                                <span className="truncate">{fileName || 'Choose a PDF file'}</span>
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
                 <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Paste the full job description here..."
                            className="min-h-[150px] md:min-h-[200px]"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyze Skill Gaps
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
        <div className="flex flex-col">
            {isLoading && (
                <Card className="flex h-full flex-col items-center justify-center">
                    <CardContent className="flex flex-col items-center justify-center gap-4 pt-6">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Analyzing your skills...</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && analysisResult && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Personalized Learning Plan</CardTitle>
                        <CardDescription>Based on our analysis, here are the key areas to focus on, along with a suggested roadmap to get you job-ready.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {analysisResult.message && (
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-green-500/50 bg-green-500/10 p-8 text-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                                <p className="mt-4 text-base font-medium text-foreground">
                                    {analysisResult.message}
                                </p>
                            </div>
                        )}
                        {analysisResult.skillGaps && analysisResult.skillGaps.length > 0 && (
                             <Accordion type="single" collapsible className="w-full">
                                {analysisResult.skillGaps.map((gap, index) => (
                                     <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger className='text-lg font-semibold text-primary hover:no-underline'>
                                            {gap.skill}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <pre className="whitespace-pre-wrap font-sans text-sm p-4 bg-muted/50 rounded-md">
                                                {gap.roadmap.join('\n\n')}
                                            </pre>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardContent>
                </Card>
            )}

            {!isLoading && !analysisResult && (
                <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium text-muted-foreground">
                        Your personalized learning plan will appear here.
                    </p>
                </div>
            )}
        </div>
    </div>
  );
}

