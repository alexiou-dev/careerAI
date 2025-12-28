'use client';

// React hooks for state management
import { useState } from 'react';
// Form handling libraries
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// UI Components
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/hooks/use-resume-store';
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
// Icons for visual elements
import { Sparkles, Loader2, Upload, FileText, Copy, Check, Download, FileType, Save } from 'lucide-react';
// AI integration for resume tailoring
import { tailorResume } from '@/ai/flows/tailor-resume';
// Toast notifications and state management
import { useToast } from '@/hooks/use-toast';
// PDF and Word document generation libraries
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
// Authentication
import { useAuth } from '@/app/(main)/auth-provider';
// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB - Maximum allowed file size
const ACCEPTED_FILE_TYPES = ['application/pdf']; // Only PDF files allowed

/**
 * Form validation schema using Zod
 * Validates both file upload and job description input
 */
const formSchema = z.object({
  resume: z
    .any()
    // Validate exactly one file is uploaded
    .refine((files) => files?.length === 1, 'Resume is required.')
    // Validate file size limit
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    // Validate file type
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf files are accepted.'
    ),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
});

// Type inference from Zod schema
type ResumeTailorFormValues = z.infer<typeof formSchema>;

/**
 * Resume Tailor Page Component
 * 
 * Allows users to upload their existing resume and tailor it for a specific job.
 * Features:
 * - PDF file upload with validation
 * - Job description input for targeting
 * - AI-powered resume optimization
 * - Multiple export options (PDF, Word)
 * - Save to resume history
 */
export default function ResumeTailorPage() {
  // State management
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [originalJobDescription, setOriginalJobDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  
  // Hooks for toast notifications and authentication
  const { toast } = useToast();
  const { user } = useAuth(); 
  
  // Resume store for saving tailored resumes
  const { addResume } = useResumeStore(user?.id);

  /**
   * React Hook Form setup with Zod validation
   */
  const form = useForm<ResumeTailorFormValues>({
    resolver: zodResolver(formSchema),
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
   * Uploads resume PDF and job description to AI service for tailoring
   */
  async function onSubmit(values: ResumeTailorFormValues) {
    setIsLoading(true);
    setTailoredResume(null);
    setOriginalJobDescription('');
    try {
      const file = values.resume[0];
      const resumePdfDataUri = await fileToDataUri(file);
      
      // Call AI resume tailoring service
      const result = await tailorResume({
        resumePdfDataUri,
        jobDescription: values.jobDescription,
      });
      
      setTailoredResume(result.tailoredResume);
      setOriginalJobDescription(values.jobDescription);
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
          title: 'Error tailoring resume',
          description: 'Something went wrong. Please check your file and try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Copy tailored resume to clipboard
   * Includes fallback for browsers without clipboard API
   */
  const handleCopy = () => {
    if (!tailoredResume) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tailoredResume)
        .then(() => {
          setHasCopied(true);
          toast({ title: "Copied to clipboard!" });
          setTimeout(() => setHasCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          toast({
            variant: "destructive",
            title: "Copy failed",
            description: "Unable to copy text to clipboard.",
          });
        });
    } else {
      toast({
        variant: "destructive",
        title: "Clipboard not supported",
        description: "Your browser does not support the clipboard API.",
      });
    }
  };

  /**
   * Download tailored resume as PDF
   * Uses jsPDF library for PDF generation
   */
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
        
        // Split text to fit within page width
        const lines = doc.splitTextToSize(tailoredResume, doc.internal.pageSize.width - margin * 2);

        // Add text line by line with page breaks
        lines.forEach((line: string) => {
          if (y + 5 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 5;
        });

        doc.save('tailored-resume.pdf');
        toast({ title: "Downloading PDF..." });
      } catch(e) {
        console.error("Failed to generate PDF", e);
        toast({
          variant: "destructive",
          title: "Error generating PDF",
          description: "Something went wrong while creating the PDF.",
        });
      }
    }
  };

  /**
   * Download tailored resume as Word document
   * Uses docx library for Word document generation
   */
  const handleDownloadWord = () => {
    if (tailoredResume) {
      try {
        const sections: (Paragraph | TextRun)[] = [];
        const lines = tailoredResume.split('\n');
        
        // Parse resume text into Word document structure
        lines.forEach(line => {
          if (line.trim() === '') {
            sections.push(new Paragraph(""));
          } else if (line.startsWith('• ')) {
            // Handle bullet points
            sections.push(new Paragraph({
              text: line.substring(2),
              bullet: {
                level: 0
              }
            }));
          } else if (line === line.toUpperCase() && line.length > 2) {
            // Handle section headers (all caps)
            sections.push(new Paragraph({
              children: [new TextRun({ text: line, bold: true })],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 120 }
            }));
          } else {
            // Handle regular text
            sections.push(new Paragraph(line));
          }
        });

        // Create Word document with custom styling
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

        // Generate and download Word file
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

  /**
   * Save tailored resume to user's resume history
   * Stores in resume store for later retrieval
   */
  const handleSaveResume = () => {
    if (tailoredResume && originalJobDescription) {
      // Create default name from job description
      const defaultName = `Resume for "${originalJobDescription.substring(0, 40)}..."`;
      addResume({
        name: defaultName, 
        tailoredResume, 
        jobDescription: originalJobDescription,
        title: ''
      });
      toast({ title: "Resume saved successfully!" });
    } else {
      toast({
        variant: "destructive",
        title: "Error saving resume",
        description: "No resume content to save.",
      });
    }
  };

  return (
    /* 
      MAIN LAYOUT CONTAINER
      - Uses CSS Grid for responsive two-column layout
      - Left: Input form, Right: Preview/output
    */
    <div className="grid gap-8 md:grid-cols-2">
      
      {/* 
        LEFT COLUMN: INPUT FORM CARD
        - Contains file upload and job description form
        - Users input their existing resume and target job details
      */}
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
              
              {/* 
                FILE UPLOAD FIELD
                - Accepts only PDF files (accept=".pdf")
                - Custom styled file input with label as button
                - Shows selected file name
                - Includes validation for file size and type
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
                          aria-label="Upload resume PDF"
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
                - Validates minimum 50 characters
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
                        className="min-h-[200px]"
                        {...field}
                        aria-label="Job description for resume tailoring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 
                SUBMIT BUTTON
                - disabled={isLoading}: Disabled during API call
                - Triggers resume tailoring process
              */}
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full"
                aria-label="Tailor resume"
              >
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
      
      {/* 
        RIGHT COLUMN: TAILORED RESUME PREVIEW
        - Preview area for AI-tailored resume
        - Contains action buttons for save/copy/download
      */}
      <Card className="flex flex-col">
        <CardHeader>
          {/* 
            HEADER WITH ACTION BUTTONS CONTAINER
            - Buttons only shown when tailoredResume exists
          */}
          <div className='flex justify-between items-start'>
            {/* Title and Description */}
            <div>
              <CardTitle>Tailored Resume</CardTitle>
              <CardDescription>
                Your AI-optimized resume will appear here.
              </CardDescription>
            </div>
            
            {/* 
              ACTION BUTTONS
              - Only displayed when tailoredResume exists
            */}
            {tailoredResume && (
              <div className="flex items-center gap-1">
                
                {/* 
                  SAVE RESUME BUTTON
                  - handleSaveResume: Saves to user's resume history
                */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSaveResume}
                  aria-label="Save tailored resume to history"
                >
                  <Save className="h-4 w-4" />
                </Button>
                
                {/* 
                  COPY BUTTON
                  - handleCopy: Copies resume text to clipboard
                  - Conditional icon: Check mark when copied, Copy icon otherwise
                  - Visual feedback for copy action
                */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                  aria-label="Copy tailored resume to clipboard"
                >
                  {hasCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                
                {/* 
                  DOWNLOAD PDF BUTTON
                  - handleDownloadPdf: Generates and downloads PDF
                */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDownloadPdf}
                  aria-label="Download tailored resume as PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                {/* 
                  DOWNLOAD WORD BUTTON
                  - handleDownloadWord: Generates and downloads .docx
                  - FileType icon: Represents Word/document file
                */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDownloadWord}
                  aria-label="Download tailored resume as Word document"
                >
                  <FileType className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          
          {/* LOADING STATE*/}
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
          
          {/* 
            TAILORED RESUME DISPLAY
            - Custom CSS styling for resume-like appearance
            - Fixed height container with scroll overflow
            - Formatted as a realistic resume document
          */}
          {tailoredResume && (
            <div className="relative flex-1 w-full h-[520px] overflow-hidden rounded-md border bg-muted/30">
              {/* Scrollable container for resume content */}
              <div className="absolute inset-0 overflow-y-auto p-6">
                {/* 
                  RESUME DOCUMENT SIMULATION
                  - White background with subtle shadow and border
                  - Custom font styling and spacing
                */}
                <div
                  className="mx-auto bg-white shadow-sm rounded-sm border border-gray-200"
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    minHeight: "100%",
                    padding: "28px", // Standard resume margins
                    fontFamily: "'Calibri', 'Helvetica', sans-serif", // Common resume fonts
                    fontSize: "11pt", // Standard resume font size
                    lineHeight: "1.5", // Readable line spacing
                    color: "#000", // Black text for print compatibility
                    whiteSpace: "pre-wrap", // Preserve line breaks
                  }}
                  // Parse and format resume text with HTML
                  dangerouslySetInnerHTML={{
                    __html: tailoredResume
                      .split('\n')
                      .map((line, i) => {
                        const trimmed = line.trim();

                        {/* 
                          FORMATTING LOGIC:
                          1. HEADER LINES (name, contact info) - Centered, bold
                          2. SECTION HEADERS (all caps) - Bold, with underline
                          3. TITLES WITH DATES - Two-column layout
                          4. BULLET POINTS - Indented with bullet symbol
                          5. DEFAULT TEXT - Regular paragraph spacing
                        */}
                        
                        // Header: Name, job title, contact info (first 5 lines)
                        if (i < 5 && (
                          /^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(trimmed) || // Name pattern
                          trimmed.toLowerCase().includes("linkedin") ||
                          trimmed.toLowerCase().includes("github") ||
                          trimmed.includes("@") // Email address
                        )) {
                          return `<div style="text-align:center;font-weight:bold;margin-bottom:2px;">${trimmed}</div>`;
                        }

                        // Section Headers: All caps text (3+ characters)
                        if (/^[A-Z\s]{3,}$/.test(trimmed)) {
                          return `<div style="font-weight:bold;font-size:12pt;margin-top:18px;margin-bottom:6px;border-bottom:1px solid #000;padding-bottom:2px;">${trimmed}</div>`;
                        }

                        // Titles with Dates: Job titles with date ranges (split layout)
                        if (trimmed.match(/(—|-|–)/) && trimmed.match(/\d{4}/)) {
                          const [left, right] = trimmed.split(/—|–|-/);
                          return `
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:6px;">
                              <div style="font-weight:bold;">${left.trim()}</div>
                              <div style="font-weight:normal;">${right.trim()}</div>
                            </div>
                          `;
                        }

                        // Bullet Points: Lines starting with •
                        if (trimmed.startsWith("•")) {
                          return `<div style="margin-left:18px;text-indent:-10px;">${trimmed}</div>`;
                        }

                        // Default Text: Regular paragraphs
                        return `<div style="margin-top:4px;">${trimmed}</div>`;
                      })
                      .join("") // Combine all formatted lines
                  }}
                />
              </div>
            </div>
          )}

          {/* 
            EMPTY STATE
            - Shown when no tailored resume and not loading
            - Centered content with dashed border
            - FileText icon: Indicates document/file
            - Instructional text
          */}
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

{/* 
div (main grid container)
├── Card (Left - Input Form)
│   ├── File Upload Area
│   │   ├── Hidden file input
│   │   └── Custom styled upload button
│   ├── Job Description Textarea
│   └── Submit Button
└── Card (Right - Output Preview)
    ├── Header with Action Buttons
    └── Content Area with 3 States
        ├── Loading Skeletons
        ├── Formatted Resume Display
        └── Empty State
*/}
