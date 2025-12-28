'use client';


import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// UI Components
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
// Icons for visual elements
import { Sparkles, Loader2, Building2, Newspaper, Briefcase } from 'lucide-react';
// AI integration for company analysis
import { analyzeCompanyFit } from '@/ai/flows/analyze-company-fit';
// Toast notifications for user feedback
import { useToast } from '@/hooks/use-toast';

// Type definitions and validation schema
import {
    CompanyFitFormSchema,
    type CompanyFitFormValues,
    type AnalyzeCompanyFitOutput,
    preferencesOptions,
} from '@/types/ai-company-fit';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Company Fit Analysis Page Component
 * 
 * Analyzes company culture and determines fit with user preferences using AI.
 * Features:
 * - Company name input with AI-powered analysis
 * - Multi-select preferences checklist
 * - Overall fit score with progress bar
 * - Company culture summary with external links
 * - Personalized alignment analysis
 */
export default function CompanyFitPage() {
  // State management
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCompanyFitOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * React Hook Form setup with Zod validation
   * Manages company name input and user preferences
   */
  const form = useForm<CompanyFitFormValues>({
    resolver: zodResolver(CompanyFitFormSchema),
    defaultValues: {
      companyName: '',
      preferences: [], // Array of selected preference options
      otherPreference: '', // Custom preference when "Other" is selected
    },
  });

  // Watch for "Other" preference selection to conditionally show custom input
  const isOtherSelected = form.watch('preferences').includes('Other (please specify)');

  /**
   * Form submission handler
   * Sends company name and preferences to AI service for analysis
   */
  async function onSubmit(values: CompanyFitFormValues) {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      // Process preferences: replace "Other" with custom value, filter empty
      const finalPreferences = values.preferences
        .map(p => (p === 'Other (please specify)' ? values.otherPreference : p))
        .filter(p => p); // Filter out empty strings

      // Call AI company analysis service
      const result = await analyzeCompanyFit({
        companyName: values.companyName,
        userPreferences: finalPreferences as string[],
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
    {/* 
      MAIN LAYOUT CONTAINER
      - Left: Input form, Right: Analysis results
    */}
    <div className="grid gap-8 md:grid-cols-2">
      
      {/* 
        LEFT COLUMN: INPUT FORM CARD
        - Contains form for company analysis input
        - Users provide company name and select preferences
      */}
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
              
              {/* 
                COMPANY NAME INPUT FIELD
                - Single-line text input for company name
                - Placeholder provides examples for clarity
                - Required field for analysis
              */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Google, Microsoft..." 
                        {...field} 
                        aria-label="Company name for analysis"
                      />
                    </FormControl>
                    {/* Validation error messages */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 
                PREFERENCES CHECKBOX GROUP
                - Multi-select checklist for user preferences
                - preferencesOptions array from types/ai-company-fit
                - Includes "Other" option with conditional text input
              */}
              <FormField
                control={form.control}
                name="preferences"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Your Preferences</FormLabel>
                      <CardDescription>
                        Select what matters most to you in a company.
                      </CardDescription>
                    </div>
                    {/* 
                      CHECKBOX GRID
                      - Map through predefined preference options
                    */}
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
                                  {/* 
                                    CHECKBOX COMPONENT
                                    - checked: Determines if option is selected
                                    - onCheckedChange: Updates selected options array
                                  */}
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
                                    aria-label={`Select preference: ${item}`}
                                  />
                                </FormControl>
                                {/* Checkbox label */}
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
              
              {/* 
                CONDITIONAL: "OTHER" PREFERENCE TEXT INPUT
                - Only shown when "Other (please specify)" is selected
                - Allows custom preference input
                - Cleared when "Other" is deselected
              */}
              {isOtherSelected && (
                <FormField
                  control={form.control}
                  name="otherPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specify "Other" Preference</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Strong mentorship programs" 
                          {...field} 
                          aria-label="Custom company preference"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* 
                SUBMIT BUTTON (PRIMARY ACTION)
                - disabled={isLoading}: Disabled during API call
                - Triggers company analysis when clicked
              */}
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full"
                aria-label="Analyze company fit"
              >
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
      
      {/* 
        RIGHT COLUMN: ANALYSIS RESULTS CARD
        - Displays AI-generated company analysis
        - Contains fit score, summary, and external links
      */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
          <CardDescription>
            The company's culture summary and your fit score will appear here.
          </CardDescription>
        </CardHeader>
        
        {/* 
          CONTENT AREA WITH THREE STATES
          - Three possible states: Loading, Results, Empty
        */}
        <CardContent className="flex-1 flex flex-col space-y-4">
          
          {/* LOADING STATE */}
          {isLoading && (
            <div className="space-y-4">
              {/* Fit score skeleton */}
              <Skeleton className="h-8 w-1/2 rounded" />
              {/* Progress bar skeleton */}
              <Skeleton className="h-24 w-full rounded" />
              {/* Section header skeleton */}
              <Skeleton className="h-8 w-1/3 rounded mt-4" />
              {/* Content skeleton */}
              <Skeleton className="h-32 w-full rounded" />
            </div>
          )}

          {/* 
            ANALYSIS RESULTS STATE
            - Displayed when analysisResult exists
            - Organized into sections with clear hierarchy
          */}
          {analysisResult && (
            <div className="space-y-6">
              
              {/* 
                FIT SCORE SECTION
                - Overall compatibility score (0-100)
                - Progress bar visualization
              */}
              <div>
                <h3 className="font-semibold text-lg">
                  Overall Fit Score: {analysisResult.overallFitScore}/100
                </h3>
                {/* Progress bar showing fit percentage */}
                <Progress 
                  value={analysisResult.overallFitScore} 
                  className="mt-2" 
                  aria-label={`Fit score: ${analysisResult.overallFitScore} out of 100`}
                />
              </div>

              {/* 
                COMPANY CULTURE SUMMARY SECTION
                - AI-generated description of company culture
                - External links for further research
              */}
              <div>
                <h3 className="font-semibold text-lg">Company Culture Summary</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysisResult.companyCultureSummary}
                </p>

                {/* 
                  EXTERNAL LINKS SECTION
                  - Opens in new tabs with security attributes
                  - Icons for visual distinction
                  - Hover effects for interactivity
                */}
                <div className="mt-3 flex flex-col space-y-2">
                  {/* Glassdoor link - employee reviews */}
                  <a
                    href={analysisResult.links.glassdoor}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                    aria-label="View Glassdoor reviews for this company"
                  >
                    <Building2 className="h-4 w-4 mr-2" /> 
                    Glassdoor Reviews
                  </a>

                  {/* Careers page link - job opportunities */}
                  <a
                    href={analysisResult.links.careers}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                    aria-label="View company careers page"
                  >
                    <Briefcase className="h-4 w-4 mr-2" /> 
                    Company Careers
                  </a>

                  {/* News link - recent company news */}
                  <a
                    href={analysisResult.links.news}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                    aria-label="View recent news about this company"
                  >
                    <Newspaper className="h-4 w-4 mr-2" /> 
                    Recent News
                  </a>
                </div>
              </div>

              {/* 
                ALIGNMENT ANALYSIS SECTION
                - Personalized analysis matching user preferences
                - AI-generated insights on compatibility
              */}
              <div>
                <h3 className="font-semibold text-lg">Alignment with Your Preferences</h3>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                  {analysisResult.alignmentAnalysis}
                </p>
              </div>
            </div>
          )}
          
          {/* 
            EMPTY STATE
            - Shown when no analysis and not loading
            - Centered content with dashed border
            - Instructional text
          */}
          {!isLoading && !analysisResult && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
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
