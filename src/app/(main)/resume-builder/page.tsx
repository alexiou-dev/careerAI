'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { Sparkles, Loader2, Copy, Check, Download, FileType, Trash2, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { generateResumeFromScratch } from '@/ai/flows/generate-resume-from-scratch';
import {
    ResumeBuilderFormSchema,
    type ResumeBuilderFormValues,
} from '@/types/ai-resume-builder';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const BulletedTextarea = ({ field, ...props }: { field: any }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const lines = value.split('\n');
      const formattedLines = lines.map((line) => {
        if (line.trim().length > 0 && !line.trim().startsWith('•')) {
          return '• ' + line;
        }
        return line;
      });
      field.onChange(formattedLines.join('\n'));
    };
  
    return <Textarea {...field} {...props} onChange={handleInputChange} />;
  };

const TagInput = ({ field, label }: { field: any, label: string }) => {
    const [inputValue, setInputValue] = useState('');
    const tags = field.value ? field.value.split('|').filter(Boolean) : [];
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        const newTags = [...tags, inputValue.trim()];
        field.onChange(newTags.join('|'));
        setInputValue('');
      }
    };
  
    const removeTag = (tagToRemove: string) => {
      const newTags = tags.filter((tag: string) => tag !== tagToRemove);
      field.onChange(newTags.join('|'));
    };
  
    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
            <div>
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full outline-none ring-ring focus:ring-2">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                    ))}
                </div>
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a skill and press Enter"
                />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  };


function GenerateResumeTab() {
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

 const form = useForm<ResumeBuilderFormValues>({
  resolver: zodResolver(ResumeBuilderFormSchema),
  defaultValues: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    summary: '',
    workExperience: [
      { jobTitle: '', company: '', location: '', responsibilities: '' }
    ],
    education: [
      { school: '', location: '', degree: '', fieldOfStudy: '' }
    ],
    leadership: [],
    technicalSkills: '',
    programmingSkills: '',
    languages: '',
    city: '',
    country: '',
  },
});

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({ control: form.control, name: 'workExperience' });
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({ control: form.control, name: 'education' });
  const { fields: leadershipFields, append: appendLeadership, remove: removeLeadership } = useFieldArray({ control: form.control, name: 'leadership' });
  const [showProgrammingSkills, setShowProgrammingSkills] = useState(false);


  async function onSubmit(values: ResumeBuilderFormValues) {
    setIsLoading(true);
    setGeneratedResume(null);
    try {
      const result = await generateResumeFromScratch(values);
      setGeneratedResume(result.generatedResume);
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
                title: 'Error Generating Resume',
                description: 'Something went wrong. Please check your inputs and try again.',
            });
        }
    } finally {
      setIsLoading(false);
    }
  }

    const handleCopy = () => {
        if (generatedResume) {
            navigator.clipboard.writeText(generatedResume);
            setHasCopied(true);
            toast({ title: 'Copied to clipboard!' });
            setTimeout(() => setHasCopied(false), 2000);
        }
    };
    
    const handleDownloadPdf = () => {
        if (generatedResume) {
            try {
                const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(11);
                const pageHeight = doc.internal.pageSize.height;
                const margin = 15;
                let y = margin;
                const lines = doc.splitTextToSize(generatedResume, doc.internal.pageSize.width - margin * 2);
                lines.forEach((line: string) => {
                    if (y + 5 > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(line, margin, y);
                    y += 5;
                });
                doc.save('generated-resume.pdf');
                toast({ title: 'Downloading PDF...' });
            } catch(e) {
                console.error('Failed to generate PDF', e);
                toast({ variant: 'destructive', title: 'Error generating PDF' });
            }
        }
    };

    const handleDownloadWord = () => {
        if (generatedResume) {
            try {
                const sections: (Paragraph | TextRun)[] = [];
                const lines = generatedResume.split('\n');
                lines.forEach(line => {
                    if (line.trim() === '') sections.push(new Paragraph(''));
                    else if (line.startsWith('• ')) sections.push(new Paragraph({ text: line.substring(2), bullet: { level: 0 } }));
                    else if (line === line.toUpperCase() && line.length > 2) sections.push(new Paragraph({ children: [new TextRun({ text: line, bold: true })], heading: HeadingLevel.HEADING_1, spacing: { after: 120 } }));
                    else sections.push(new Paragraph(line));
                });
                const doc = new Document({ sections: [{ children: sections as Paragraph[] }] });
                Packer.toBlob(doc).then(blob => {
                    saveAs(blob, 'generated-resume.docx');
                    toast({ title: 'Downloading Word document...' });
                });
            } catch (e) {
                console.error('Failed to generate Word document', e);
                toast({ variant: 'destructive', title: 'Error generating Word document' });
            }
        }
    };

    const DatePickerField = ({ field, label }: { field: any, label: string }) => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
        const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        
        const [month, year] = (field.value || '').split(' ');
        
        return (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <div className="flex gap-2">
              <Select
                value={month}
                onValueChange={(m) => field.onChange(`${m} ${year || currentYear}`)}
              >
                <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select
                value={year}
                 onValueChange={(y) => field.onChange(`${month || 'January'} ${y}`)}
              >
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <FormMessage />
          </FormItem>
        );
      };

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Generate from Scratch</CardTitle>
                    <CardDescription>Enter your professional details to generate a new resume.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <h3 className="text-lg font-semibold">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="jobTitle" render={({ field }) => (<FormItem><FormLabel>Job Title / Role</FormLabel><FormControl><Input placeholder="Data Analyst" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="example@gmail.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+301111111111" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Chicago" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="US" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="linkedin" render={({ field }) => (<FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="github" render={({ field }) => (<FormItem><FormLabel>GitHub URL</FormLabel><FormControl><Input placeholder="https://github.com/..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="portfolio" render={({ field }) => (<FormItem><FormLabel>Portfolio URL</FormLabel><FormControl><Input placeholder="https://..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            </div>

                            <Separator />
                            <h3 className="text-lg font-semibold">Summary</h3>
                            <FormField control={form.control} name="summary" render={({ field }) => (<FormItem><FormLabel>Professional Summary</FormLabel><FormControl><Textarea placeholder="Analytical and results-oriented..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>)} />

                            <Separator />
                            <h3 className="text-lg font-semibold">Work Experience</h3>
                            {workFields.map((item, index) => (
                                <div key={item.id} className="space-y-4 p-4 border rounded-md relative">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`workExperience.${index}.jobTitle`} render={({ field }) => (<FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="Junior Data Analyst" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`workExperience.${index}.company`} render={({ field }) => (<FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Microsoft" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`workExperience.${index}.location`} render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="London, UK" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                                            <FormField control={form.control} name={`workExperience.${index}.startDate`} render={({ field }) => <DatePickerField field={field} label="Start Date" />} />
                                            <FormField control={form.control} name={`workExperience.${index}.endDate`} render={({ field }) => <DatePickerField field={field} label="End Date" />} />
                                        </div>
                                    </div>
                                    <FormField control={form.control} name={`workExperience.${index}.responsibilities`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><BulletedTextarea field={field}  placeholder="• Collaborated with a cross-functional team..." /></FormControl><FormMessage /></FormItem>)} />
                                     <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeWork(index)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={() => appendWork({ jobTitle: '', company: '', location: '', responsibilities: '', startDate: undefined, endDate: undefined })}><Plus className="mr-2 h-4 w-4" /> Add Experience</Button>

                            <Separator />
                            <h3 className="text-lg font-semibold">Education</h3>
                            {educationFields.map((item, index) => (
                                <div key={item.id} className="space-y-4 p-4 border rounded-md relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`education.${index}.school`} render={({ field }) => (<FormItem><FormLabel>School/University</FormLabel><FormControl><Input placeholder="University of Amsterdam" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`education.${index}.location`} render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="Amsterdam, Netherlands" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (<FormItem><FormLabel>Degree</FormLabel><FormControl><Input placeholder="Master of Science" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`education.${index}.fieldOfStudy`} render={({ field }) => (<FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input placeholder="Data Science" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                                            <FormField control={form.control} name={`education.${index}.startDate`} render={({ field }) => <DatePickerField field={field} label="Start Date" />} />
                                            <FormField control={form.control} name={`education.${index}.endDate`} render={({ field }) => <DatePickerField field={field} label="End Date" />} />
                                        </div>
                                    </div>
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeEducation(index)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendEducation({ school: '', location: '', degree: '', fieldOfStudy: '', startDate: undefined, endDate: undefined })}><Plus className="mr-2 h-4 w-4" /> Add Education</Button>
                            
                            <Separator />
                            <h3 className="text-lg font-semibold">Leadership & Activities</h3>
                             {leadershipFields.map((item, index) => (
                                <div key={item.id} className="space-y-4 p-4 border rounded-md relative">
                                    <FormField control={form.control} name={`leadership.${index}.organization`} render={({ field }) => (<FormItem><FormLabel>Organization/Project</FormLabel><FormControl><Input placeholder="Independent Research Project" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`leadership.${index}.role`} render={({ field }) => (<FormItem><FormLabel>Your Role</FormLabel><FormControl><Input placeholder="Researcher" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`leadership.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><BulletedTextarea field={field} /></FormControl><FormMessage /></FormItem>)} />
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeLeadership(index)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={() => appendLeadership({ organization: '', role: '', description: '' })}><Plus className="mr-2 h-4 w-4" /> Add Activity</Button>


                            <Separator />
                            <h3 className="text-lg font-semibold">Skills</h3>
                            <div className="space-y-4">
                                <FormField control={form.control} name="technicalSkills" render={({ field }) => <TagInput field={field} label="Technical Skills" />} />
                                {showProgrammingSkills ? (
                                    <div className="relative">
                                        <FormField control={form.control} name="programmingSkills" render={({ field }) => <TagInput field={field} label="Programming Skills" />} />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -top-2 right-0 h-6 w-6"
                                            onClick={() => {
                                            form.setValue('programmingSkills', '');
                                            setShowProgrammingSkills(false);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button type="button" variant="link" className="p-0" onClick={() => setShowProgrammingSkills(true)}>
                                        <Plus className="mr-2 h-4 w-4" /> Add programming skills
                                    </Button>
                                )}
                                <FormField control={form.control} name="languages" render={({ field }) => (<FormItem><FormLabel>Spoken Languages</FormLabel><FormControl><Input placeholder="e.g., English (Fluent), Greek (Native)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Sparkles className="mr-2 h-4 w-4" />)}
                                Generate Resume
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <div className='flex justify-between items-start'>
                        <div>
                            <CardTitle>Generated Resume</CardTitle>
                            <CardDescription>Your AI-generated resume will appear here.</CardDescription>
                        </div>
                        {generatedResume && (
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} aria-label="Copy resume">{hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}</Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownloadPdf} aria-label="Download as PDF"><Download className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownloadWord} aria-label="Download as Word"><FileType className="h-4 w-4" /></Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    {isLoading && (
                        <div className="space-y-2 flex-1 animate-pulse">
                            <div className="h-4 w-3/4 rounded bg-muted"></div>
                            <div className="h-4 w-full rounded bg-muted"></div>
                            <div className="h-4 w-5/6 rounded bg-muted"></div>
                        </div>
                    )}
                    {generatedResume && (
                        <Textarea
                            readOnly
                            value={generatedResume}
                            className="h-full min-h-[300px] text-sm bg-muted/50 focus-visible:ring-0"
                            aria-label="Generated resume text"
                        />
                    )}
                    {!isLoading && !generatedResume && (
                        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
                            <Sparkles className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-4 text-sm text-muted-foreground">Your resume will be generated here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResumeBuilderPage() {
    return <GenerateResumeTab />;
}
