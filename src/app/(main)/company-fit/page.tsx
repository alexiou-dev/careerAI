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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, Building2 } from 'lucide-react';
import { analyzeCompanyFit } from '@/ai/flows/analyze-company-fit';
import { useToast } from '@/hooks/use-toast';
import {
    CompanyFitFormSchema,
    type CompanyFitFormValues,
    type AnalyzeCompanyFitOutput,
    preferencesOptions,
} from '@/types/ai-company-fit';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyFitPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCompanyFitOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CompanyFitFormValues>({
    resolver: zodResolver(CompanyFitFormSchema),
    defaultValues: {
      companyName: '',
      preferences: [],
    },
  });

  async function onSubmit(values: CompanyFitFormValues) {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeCompanyFit({
        companyName: values.companyName,
        userPreferences: values.preferences,
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Analyzing Company',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Company Fit Analyzer</CardTitle>
          <CardDescription>
            Get an AI-powered analysis of a company's culture and how it matches your preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Google, Microsoft..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                        <FormLabel className="text-base">Your Preferences</FormLabel>
                        <CardDescription>Select what matters most to you in a company.</CardDescription>
                    </div>
                    <div className="space-y-2">
                        {preferencesOptions.map((item) => (
                        <FormField
                            key={item}
                            control={form.control}
                            name="preferences"
                            render={({ field }) => {
                            return (
                                <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                <FormControl>
                                    <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(
                                            field.value?.filter(
                                                (value) => value !== item
                                            )
                                            );
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                                </FormItem>
                            );
                            }}
                        />
                        ))}
                    </div>
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
                Analyze Company Fit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
          <CardDescription>The company's culture summary and your fit score will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2 rounded" />
              <Skeleton className="h-24 w-full rounded" />
              <Skeleton className="h-8 w-1/3 rounded mt-4" />
              <Skeleton className="h-32 w-full rounded" />
            </div>
          )}
          {analysisResult && (
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg">Overall Fit Score: {analysisResult.overallFitScore}/100</h3>
                    <Progress value={analysisResult.overallFitScore} className="mt-2" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Company Culture Summary</h3>
                    <p className="text-sm text-muted-foreground mt-1">{analysisResult.companyCultureSummary}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Alignment with Your Preferences</h3>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{analysisResult.alignmentAnalysis}</p>
                </div>
            </div>
          )}
          {!isLoading && !analysisResult && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">Your analysis will be shown here once generated.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
