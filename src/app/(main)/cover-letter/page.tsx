'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, Upload, FileText, Copy, Check, PenSquare } from 'lucide-react';
import { generateDocument } from '@/ai/flows/generate-document';
import { useToast } from '@/hooks/use-toast';
import {
  GenerateDocumentFormSchema,
  type GenerateDocumentFormValues,
  documentTypes,
  type DocumentType,
  MAX_FILE_SIZE,
  ACCEPTED_FILE_TYPES,
} from '@/types/ai-documents';


export default function AIWriterPage() {
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateDocumentFormValues>({
    resolver: zodResolver(GenerateDocumentFormSchema),
  });

  const fileRef = form.register('resume');

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

  async function onSubmit(values: GenerateDocumentFormValues) {
    setIsLoading(true);
    setGeneratedDocument(null);
    try {
      const file = values.resume[0];
      const resumePdfDataUri = await fileToDataUri(file);
      const result = await generateDocument({
        resumePdfDataUri,
        jobDescription: values.jobDescription,
        documentType: values.documentType,
      });
      setGeneratedDocument(result.generatedDocument);
    } catch (error: any) {
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

  const handleCopy = () => {
    if (generatedDocument) {
      navigator.clipboard.writeText(generatedDocument);
      setHasCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Document Writer</CardTitle>
          <CardDescription>
            Generate personalized cover letters, thank-you emails, and more.
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
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document type to generate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentTypes.map((type) => (
                           <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                Generate Document
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle>Generated Document</CardTitle>
                    <CardDescription>
                      Your AI-generated document will appear here.
                    </CardDescription>
                </div>
                 {generatedDocument && (
                    <div className="flex items-center gap-1">
                      <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleCopy}
                          aria-label="Copy document"
                      >
                          {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                 )}
            </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {isLoading && (
            <div className="space-y-2 flex-1 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-muted"></div>
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-5/6 rounded bg-muted"></div>
            </div>
          )}
          {generatedDocument && (
            <Textarea
              readOnly
              value={generatedDocument}
              className="h-full min-h-[300px] text-sm bg-muted/50 focus-visible:ring-0"
              aria-label="Generated document text"
            />
          )}
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
