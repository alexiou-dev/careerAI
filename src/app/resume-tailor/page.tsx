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
import { Sparkles, Loader2, Upload, FileText, Copy, Check, Download, FileType } from 'lucide-react';
import { tailorResume } from '@/ai/flows/tailor-resume';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf'];

const formSchema = z.object({
  resume: z
    .any()
    .refine((files) => files?.length === 1, 'Resume is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf files are accepted.'
    ),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
});

type ResumeTailorFormValues = z.infer<typeof formSchema>;

export default function ResumeTailorPage() {
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResumeTailorFormValues>({
    resolver: zodResolver(formSchema),
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

  async function onSubmit(values: ResumeTailorFormValues) {
    setIsLoading(true);
    setTailoredResume(null);
    try {
      const file = values.resume[0];
      const resumePdfDataUri = await fileToDataUri(file);
      const result = await tailorResume({
        resumePdfDataUri,
        jobDescription: values.jobDescription,
      });
      setTailoredResume(result.tailoredResume);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error tailoring resume',
        description: 'Something went wrong. Please check your file and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    if (tailoredResume) {
      navigator.clipboard.writeText(tailoredResume);
      setHasCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };
  
  const handleDownloadPdf = () => {
    if (tailoredResume) {
      try {
        const doc = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4'
        });
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        let y = margin;
        
        // Split text into lines
        const lines = doc.splitTextToSize(tailoredResume, doc.internal.pageSize.width - margin * 2);

        lines.forEach((line: string) => {
            if (y + 5 > pageHeight - margin) { // Check if new page is needed
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin, y);
            y += 5; // Line height
        });

        doc.save('tailored-resume.pdf');
        toast({ title: "Downloading PDF..." });
      } catch(e) {
        console.error("Failed to generate PDF", e)
        toast({
          variant: "destructive",
          title: "Error generating PDF",
          description: "Something went wrong while creating the PDF.",
        })
      }
    }
  };

  const handleDownloadWord = () => {
    if (tailoredResume) {
      try {
        const sections: (Paragraph | TextRun)[] = [];
        const lines = tailoredResume.split('\n');
        lines.forEach(line => {
          if (line.trim() === '') {
            sections.push(new Paragraph(""));
          } else if (line.startsWith('• ')) {
            sections.push(new Paragraph({
              text: line.substring(2),
              bullet: {
                level: 0
              }
            }));
          } else if (line === line.toUpperCase() && line.length > 2) {
             sections.push(new Paragraph({
              children: [new TextRun({ text: line, bold: true })],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 120 }
            }));
          } else {
             sections.push(new Paragraph(line));
          }
        });

        const doc = new Document({
          sections: [{
            children: sections as Paragraph[],
          }],
          styles: {
            paragraphStyles: [{
              id: "HEADING_1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              run: {
                bold: true,
                size: 24, // 12pt
              },
              paragraph: {
                spacing: { after: 120 },
              }
            }]
          }
        });

        Packer.toBlob(doc).then(blob => {
          saveAs(blob, "tailored-resume.docx");
          toast({ title: "Downloading Word document..." });
        });
      } catch (e) {
        console.error("Failed to generate Word document", e);
        toast({
          variant: "destructive",
          title: "Error generating Word document",
          description: "Something went wrong while creating the file.",
        });
      }
    }
  };


  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tailor Your Resume</CardTitle>
          <CardDescription>
            Upload your resume (PDF) and paste the job description below.
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
                Tailor Resume
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle>Tailored Resume</CardTitle>
                    <CardDescription>
                    Your AI-optimized resume will appear here.
                    </CardDescription>
                </div>
                 {tailoredResume && (
                    <div className="flex items-center gap-1">
                      <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleCopy}
                          aria-label="Copy resume"
                      >
                          {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleDownloadPdf}
                          aria-label="Download resume as PDF"
                      >
                         <Download className="h-4 w-4" />
                      </Button>
                       <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleDownloadWord}
                          aria-label="Download resume as Word"
                      >
                         <FileType className="h-4 w-4" />
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
              <div className="h-4 w-1/2 rounded bg-muted mt-4"></div>
              <div className="h-4 w-full rounded bg-muted"></div>
            </div>
          )}
          {tailoredResume && (
            <Textarea
              readOnly
              value={tailoredResume}
              className="h-full min-h-[300px] text-sm bg-muted/50 focus-visible:ring-0"
              aria-label="Tailored resume text"
            />
          )}
          {!isLoading && !tailoredResume && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
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
