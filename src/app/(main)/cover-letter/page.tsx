'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Icons for visual elements
import { Sparkles, Loader2, Upload, FileText, Copy, Check, PenSquare } from 'lucide-react';
// AI integration for document generation
import { generateDocument } from '@/ai/flows/generate-document';
// Toast notifications for user feedback
import { useToast } from '@/hooks/use-toast';
// Type definitions and validation schema
import {
  GenerateDocumentFormSchema,
  type GenerateDocumentFormValues,
  documentTypes,
} from '@/types/ai-documents';

/**
 * AI Writer Page Component
 * 
 * Generates various career-related documents using AI:
 * - Cover letters
 * - Thank-you emails
 * - Outreach communications 
 * Users upload their resume and provide job description for context.
 */
export default function AIWriterPage() {
  // State management
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  /**
   * React Hook Form setup with Zod validation
   * Validates file upload, job description and document type
   */
  const form = useForm<GenerateDocumentFormValues>({
    resolver: zodResolver(GenerateDocumentFormSchema),
  });

  // File input registration for react-hook-form
  const fileRef = form.register('resume');

  /**
   * Converts a File object to a Data URI (base64 string)
   * Used for sending PDF content to the AI service
   */
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

  /**
   * Form submission handler
   * Uploads resume PDF and job description to AI service for document generation
   */
  async function onSubmit(values: GenerateDocumentFormValues) {
    setIsLoading(true);
    setGeneratedDocument(null);
    try {
      const file = values.resume[0];
      const resumePdfDataUri = await fileToDataUri(file);
      
      // Call AI document generation service
      const result = await generateDocument({
        resumePdfDataUri,
        jobDescription: values.jobDescription,
        documentType: values.documentType,
      });
      
      setGeneratedDocument(result.generatedDocument);
    } catch (error: any) {
      // Handle specific API rate limiting errors
      if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
        toast({
          variant: 'destructive',
          title: 'API Quota Exceeded',
          description: "You've reached the daily limit for the free tier. Please try again tomorrow.",
        });
      } else {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error generating document',
          description: 'Something went wrong. Please check your inputs and try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  /**
   * Copy generated document to clipboard
   * Includes visual feedback with checkmark icon
   */
  const handleCopy = () => {
    if (generatedDocument) {
      navigator.clipboard.writeText(generatedDocument);
      setHasCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    {/* 
      MAIN LAYOUT CONTAINER
      - Left: Input form, Right: Generated document preview
    */}
    <div className="grid gap-8 md:grid-cols-2">
      
      {/* 
        LEFT COLUMN: INPUT FORM CARD
        - Contains all input fields for document generation
        - Users provide resume, job description and select document type
      */}
      <Card>
        <CardHeader>
          <CardTitle>AI Document Writer</CardTitle>
          <CardDescription>
            Generate personalized cover letters, thank-you emails, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 
            REACT HOOK FORM WRAPPER
            - Provides form context to all child form fields
            - form.handleSubmit: Handles validation and submission
          */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* 
                RESUME FILE UPLOAD FIELD
                - Accepts only PDF files (accept=".pdf")
                - Custom styled file input with label as button
                - Shows selected file name
                - Includes validation for required file
              */}
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Resume (PDF)</FormLabel>
                    <FormControl>
                      <div>
                        {/* Hidden actual file input */}
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
                          aria-label="Upload resume PDF for document generation"
                        />
                        {/* Custom styled file upload button */}
                        <label
                          htmlFor="resume-upload"
                          className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground ring-offset-background cursor-pointer hover:bg-accent hover:text-accent-foreground"
                          aria-label="Choose PDF file"
                        >
                          <Upload className="h-4 w-4" />
                          <span className='truncate'>{fileName || 'Choose a PDF file'}</span>
                        </label>
                      </div>
                    </FormControl>
                    {/* Validation error messages */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 
                JOB DESCRIPTION TEXTAREA
                - Placeholder guides user to paste full job description
                - Provides context for AI to personalize the document
              */}
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full job description here..."
                        className="min-h-[150px]"
                        {...field}
                        aria-label="Job description for document personalization"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               
              {/* 
                DOCUMENT TYPE SELECTOR
                - Dropdown for selecting type of document to generate
                - Uses custom icons for each document type
                - documentTypes array from types/ai-documents
                - Includes cover letters, thank-you emails, etc.
              */}
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    {/* 
                      SELECT COMPONENT WITH ICONS
                      - onValueChange: Updates form field
                      - defaultValue: Current field value
                    */}
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document type to generate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* 
                          MAP THROUGH DOCUMENT TYPES
                          - Each type has value, label and icon
                          - Icon component is dynamically rendered
                        */}
                        {documentTypes.map((doc) => {
                          const Icon = doc.icon; 
                          return (
                           <SelectItem key={doc.value} value={doc.value}>
                             {/* Custom layout with icon and label */}
                             <div className='flex items-center gap-2'>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span>{doc.label}</span>
                              </div>
                           </SelectItem>
                        );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 
                SUBMIT BUTTON (PRIMARY ACTION)
                - disabled={isLoading}: Disabled during API call
                - Triggers document generation when clicked
              */}
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full"
                aria-label="Generate document"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Document
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* 
        RIGHT COLUMN: GENERATED DOCUMENT PREVIEW
        - Contains copy button for generated content
      */}
      <Card className="flex flex-col">
        <CardHeader>
          {/* 
            HEADER WITH COPY BUTTON CONTAINER
            - Copy button only shown when document is generated
          */}
          <div className='flex justify-between items-start'>
            {/* Title and Description */}
            <div>
              <CardTitle>Generated Document</CardTitle>
              <CardDescription>
                Your AI-generated document will appear here.
              </CardDescription>
            </div>
            
            {/* 
              COPY BUTTON
              - Only displayed when generatedDocument exists
              - handleCopy: Copies document text to clipboard
            */}
            {generatedDocument && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                  aria-label="Copy generated document to clipboard"
                >
                  {/* Conditional icon: Checkmark when copied, Copy icon otherwise */}
                  {hasCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        {/* PREVIEW CONTENT AREA */}
        <CardContent className="flex-1 flex flex-col">
          
          {/* LOADING STATE */}
          {isLoading && (
            <div className="space-y-2 flex-1 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-muted"></div>
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-5/6 rounded bg-muted"></div>
            </div>
          )}
          
          {/* 
            GENERATED DOCUMENT DISPLAY
            - Read-only textarea for document preview
          */}
          {generatedDocument && (
            <Textarea
              readOnly
              value={generatedDocument}
              className="h-full min-h-[300px] text-sm bg-muted/50 focus-visible:ring-0"
              aria-label="Generated document text"
            />
          )}
          
          {/* 
            EMPTY STATE
            - Shown when no document and not loading
            - Centered content with dashed border
            - PenSquare icon: Indicates writing/document
            - Instructional text
          */}
          {!isLoading && !generatedDocument && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
              <PenSquare className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Your result will be shown here once generated.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

{/* 
div.grid.gap-8.md:grid-cols-2
├── Card (Left - Input Form)
│   ├── CardHeader (Title + Description)
│   └── CardContent
│       └── Form
│           ├── File Upload Field
│           ├── Job Description Textarea
│           ├── Document Type Selector
│           └── Submit Button
└── Card (Right - Output Preview)
    ├── CardHeader (Title + Copy Button)
    └── CardContent
        ├── Loading State (Skeletons)
        ├── Generated Document (Textarea)
        └── Empty State (Centered)
*/}
