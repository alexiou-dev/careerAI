'use client';

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, Upload, X, Pencil, Trash2, RefreshCw, Star } from 'lucide-react';
import { type InterviewPrepFormValues, type StoredInterview } from '@/types/ai-interview';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
  } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface InterviewSetupProps {
    form: UseFormReturn<InterviewPrepFormValues>;
    isLoading: boolean;
    interviews: StoredInterview[];
    activeInterview: StoredInterview | null;
    onStartInterview: (values: InterviewPrepFormValues) => void;
    onSelectInterview: (interview: StoredInterview) => void;
    onRenameInterview: (id: string, name: string) => void;
    onDeleteInterview: (id: string) => void;
    onPracticeAgain: (interview: StoredInterview) => void;
}

export function InterviewSetup({
    form,
    isLoading,
    interviews,
    activeInterview,
    onStartInterview,
    onSelectInterview,
    onRenameInterview,
    onDeleteInterview,
    onPracticeAgain,
}: InterviewSetupProps) {
  const [fileName, setFileName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [interviewToRename, setInterviewToRename] = useState<StoredInterview | null>(null);
  const { toast } = useToast();
  
  const fileRef = form.register('resume');

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    form.setValue('resume', null);
    setFileName('');
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const handleRenameSubmit = () => {
    if (interviewToRename && renameValue) {
        onRenameInterview(interviewToRename.id, renameValue);
        toast({ title: "Interview Renamed" });
    }
    setInterviewToRename(null);
    setRenameValue('');
  }

  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Interview Prep Coach</CardTitle>
                <CardDescription>Start a new mock interview session.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onStartInterview)} className="space-y-4">
                        <FormField control={form.control} name="jobRole" render={({ field }) => (<FormItem><FormLabel>Job Role</FormLabel><FormControl><Input placeholder="e.g., Product Manager" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="jobDescription" render={({ field }) => (<FormItem><FormLabel>Job Description (Optional)</FormLabel><FormControl><Textarea placeholder="Paste the job description for more tailored questions." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField
                            control={form.control}
                            name="resume"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Resume (PDF, Optional)</FormLabel>
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
                                      <span className='truncate'>{fileName || 'Choose a PDF file'}</span>
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
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Start New Interview
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        <Card className="flex flex-col flex-1 min-h-0">
            <CardHeader>
            <CardTitle>Interview History</CardTitle>
            <CardDescription>Review your past sessions.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-2 min-h-0">
              <ScrollArea className="h-full">
                <ul className='space-y-1 pr-2'>
                    {interviews.length === 0 && (
                        <li className='text-center text-sm text-muted-foreground py-4'>No past interviews.</li>
                    )}
                    {interviews.map(interview => {
                        const hasModelAnswer = interview.questions.some(q => q.modelAnswer);
                        const scoreColor = interview.score != null
                            ? interview.score >= 80 ? 'text-green-500'
                            : interview.score >= 70 ? 'text-yellow-500'
                            : 'text-muted-foreground'
                            : '';
                    return (
                    <li key={interview.id} className='group'>
                        <div
                            role="button"
                            onClick={() => onSelectInterview(interview)}
                            className={cn(
                                'flex items-center justify-between w-full rounded-md p-2 text-left h-auto hover:bg-accent cursor-pointer',
                                activeInterview?.id === interview.id ? 'bg-secondary' : 'bg-transparent'
                            )}
                        >
                            <div className='flex-1 truncate pr-2'>
                                <p className='font-semibold truncate'>{interview.name}</p>
                                <p className='text-xs text-muted-foreground'>{new Date(interview.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className='flex items-center'>
                                {interview.score != null && !hasModelAnswer && (
                                    <span className={cn('text-sm font-bold mr-2', scoreColor)}>
                                        {interview.score}%
                                    </span>
                                )}
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => {e.stopPropagation(); onPracticeAgain(interview)}}><RefreshCw className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => {e.stopPropagation(); setInterviewToRename(interview); setRenameValue(interview.name); }}><Pencil className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Delete Interview?</AlertDialogTitle></AlertDialogHeader>
                                            <AlertDialogDescription>This will permanently delete "{interview.name}".</AlertDialogDescription>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDeleteInterview(interview.id)} className='bg-destructive hover:bg-destructive/90'>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </div>
                    </li>
                    )})}
                </ul>
              </ScrollArea>
               <Dialog open={!!interviewToRename} onOpenChange={(open) => { if(!open) setInterviewToRename(null) }}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Rename Interview</DialogTitle></DialogHeader>
                        <Input value={renameValue} onChange={e => setRenameValue(e.target.value)} placeholder="Enter new name" />
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleRenameSubmit}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
      </div>
  )
}
