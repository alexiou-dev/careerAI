'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
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
import { Bot, Loader2, Sparkles, User, Trash2, Pencil, Send, ArrowDown, Upload, X } from 'lucide-react';
import {
    generateInterviewQuestions,
    getExampleAnswer,
    getInterviewFeedback,
} from '@/ai/flows/interview-prep';
import {
  InterviewPrepFormSchema,
  type InterviewPrepFormValues,
  type StoredInterview,
  type InterviewQuestion,
} from '@/types/ai-interview';
import { useToast } from '@/hooks/use-toast';
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
  } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const INTERVIEW_STORAGE_KEY = 'interview-history';

type ChatMessage = {
    role: 'bot' | 'user';
    content: string;
    isModelAnswer?: boolean;
}

export default function InterviewPrepPage() {
  const [interviews, setInterviews] = useState<StoredInterview[]>([]);
  const [activeInterview, setActiveInterview] = useState<StoredInterview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const { toast } = useToast();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [fileName, setFileName] = useState('');
  const [modelAnswerContext, setModelAnswerContext] = useState('');
  const [isModelAnswerDialogOpen, setIsModelAnswerDialogOpen] = useState(false);


  // ref to the messages viewport (the element that actually scrolls)
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);

  // when true => allow auto-scrolling to bottom; when false => user is reviewing older messages
  const autoScrollRef = useRef<boolean>(true);
  const AUTO_SCROLL_THRESHOLD_PX = 150; // within this px from bottom we consider "at bottom"

  useEffect(() => {
    try {
      const stored = localStorage.getItem(INTERVIEW_STORAGE_KEY);
      if (stored) {
        setInterviews(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load interviews from storage', e);
    }
  }, []);

  // Auto-scroll when messages change, only if user is near bottom
  useEffect(() => {
    const el = messagesViewportRef.current;
    if (!el) return;
    if (autoScrollRef.current) {
      // small timeout to ensure layout updated
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [messages]);

  const saveInterviews = useCallback((updatedInterviews: StoredInterview[], newActiveInterview?: StoredInterview | null) => {
    setInterviews(updatedInterviews);
    if (newActiveInterview !== undefined) {
        setActiveInterview(newActiveInterview);
    }
    try {
      localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(updatedInterviews));
    } catch (e) {
      console.error('Failed to save interviews to storage', e);
    }
  }, []);

  const form = useForm<InterviewPrepFormValues>({
    resolver: zodResolver(InterviewPrepFormSchema),
    defaultValues: { jobRole: '', jobDescription: '' },
  });

  const fileRef = form.register('resume');
  
  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    form.setValue('resume', null);
    setFileName('');
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

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

  const handleStartInterview = async (values: InterviewPrepFormValues) => {
    setIsLoading(true);
    setActiveInterview(null);
    setMessages([]);

    try {
        let resumePdfDataUri: string | undefined = undefined;
        if (values.resume && values.resume.length > 0) {
            resumePdfDataUri = await fileToDataUri(values.resume[0]);
        }

      const { questions } = await generateInterviewQuestions({
        jobRole: values.jobRole,
        jobDescription: values.jobDescription,
        resumePdfDataUri,
      });

      const newInterview: StoredInterview = {
        id: `interview_${Date.now()}`,
        name: `${values.jobRole} Interview`,
        jobRole: values.jobRole,
        jobDescription: values.jobDescription,
        resumePdfDataUri: resumePdfDataUri,
        questions: questions.map(q => ({ question: q, userAnswer: '', modelAnswer: ''})),
        feedback: '',
        createdAt: new Date().toISOString(),
      };

      const updatedInterviews = [newInterview, ...interviews];
      // enable auto-scroll for a new session
      autoScrollRef.current = true;
      
      setCurrentQuestionIndex(0);
      setMessages([{ role: 'bot', content: newInterview.questions[0].question }]);
      saveInterviews(updatedInterviews, newInterview);
      
      form.reset();
      setFileName('');
    } catch (error) {
        console.error(error);
        if (error instanceof Error && (error.message.includes('RATE_LIMIT_EXCEEDED'))) {
            toast({
                variant: 'destructive',
                title: 'API Quota Exceeded',
                description: "You've reached the daily limit for the free tier. Please try again tomorrow.",
            });
        } else {
            toast({ variant: 'destructive', title: 'Error starting interview' });
        }
    } finally {
      setIsLoading(false);
    }
  };

 const handleSelectInterview = (interview: StoredInterview) => {
    setActiveInterview(interview);

    const reconstructedMessages: ChatMessage[] = [];
    let nextQuestionIndex = 0;
    
    if (interview.questions && interview.questions.length > 0) {
      for (let i = 0; i < interview.questions.length; i++) {
        const q = interview.questions[i];
        
        reconstructedMessages.push({ role: 'bot', content: q.question });
        
        if (q.userAnswer) {
          reconstructedMessages.push({ role: 'user', content: q.userAnswer });
          nextQuestionIndex = i + 1;
        } else if (q.modelAnswer) {
          reconstructedMessages.push({ role: 'bot', content: q.modelAnswer, isModelAnswer: true });
          nextQuestionIndex = i + 1;
        } else {
          // This is the first unanswered question, so we stop here.
          break;
        }
      }
    }

    if (interview.feedback) {
        reconstructedMessages.push({ role: 'bot', content: interview.feedback });
    }

    setMessages(reconstructedMessages);

    // If we've answered all questions, index should be length of questions array.
    if (nextQuestionIndex >= interview.questions.length && interview.questions.every(q => q.userAnswer || q.modelAnswer)) {
      setCurrentQuestionIndex(interview.questions.length);
    } else {
      setCurrentQuestionIndex(nextQuestionIndex);
    }

    autoScrollRef.current = true;
    requestAnimationFrame(() => {
      const el = messagesViewportRef.current;
      if (el) {
        el.scrollTo({ top: el.scrollHeight });
      }
    });
  };

  const updateActiveInterviewInStorage = (updatedInterview: StoredInterview) => {
    const updatedInterviews = interviews.map(i => i.id === updatedInterview.id ? updatedInterview : i);
    saveInterviews(updatedInterviews, updatedInterview);
  };

  const handleNextQuestion = () => {
    if (!activeInterview) return;

    const currentQuestion = activeInterview.questions[currentQuestionIndex];
    if (userInput.trim()) {
        const updatedQuestion: InterviewQuestion = { ...currentQuestion, userAnswer: userInput };
        const updatedQuestions = [...activeInterview.questions];
        updatedQuestions[currentQuestionIndex] = updatedQuestion;
        const updatedInterview: StoredInterview = { ...activeInterview, questions: updatedQuestions };

        updateActiveInterviewInStorage(updatedInterview);
        setMessages(prev => [...prev, {role: 'user', content: userInput}]);

        // when user submits an answer, we want to auto-scroll so they see the next question
        autoScrollRef.current = true;
    }

    setUserInput('');
    setIsAnswering(false);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < activeInterview.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setMessages(prev => [...prev, {role: 'bot', content: activeInterview.questions[nextIndex].question}]);
    } else {
      setCurrentQuestionIndex(activeInterview.questions.length);
    }
  };

  const handleGetModelAnswer = async () => {
    if (!activeInterview) return;
    setIsAnswering(true);
    setIsModelAnswerDialogOpen(false);

    try {
        const currentQuestion = activeInterview.questions[currentQuestionIndex];

        // Combine any previously saved context with the current input
        const accumulatedContext = [
            activeInterview.modelAnswerContext || '',
            modelAnswerContext || ''
        ].filter(Boolean).join(' | '); // join multiple contexts

        const result = await getExampleAnswer({
            jobRole: activeInterview.jobRole,
            question: currentQuestion.question,
            resumePdfDataUri: activeInterview.resumePdfDataUri,
            context: accumulatedContext || undefined,
        });

        const updatedQuestion = { ...currentQuestion, modelAnswer: result.exampleAnswer };
        const updatedQuestions = [...activeInterview.questions];
        updatedQuestions[currentQuestionIndex] = updatedQuestion;

        // Save the accumulated context in the interview state
        const updatedInterview: StoredInterview = {
            ...activeInterview,
            modelAnswerContext: accumulatedContext,
            questions: updatedQuestions
        };

        updateActiveInterviewInStorage(updatedInterview);

        setMessages(prev => [
            ...prev,
            { role: 'bot', content: result.exampleAnswer, isModelAnswer: true }
        ]);

        // Clear the input field but keep the accumulated context
        setModelAnswerContext('');

        // Move to the next question and auto-scroll
        autoScrollRef.current = true;
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < activeInterview.questions.length) {
            setCurrentQuestionIndex(nextIndex);
            setMessages(prev => [
                ...prev,
                { role: 'bot', content: activeInterview.questions[nextIndex].question }
            ]);
        } else {
            setCurrentQuestionIndex(activeInterview.questions.length);
        }

    } catch (e) {
        if (e instanceof Error && e.message.includes('RATE_LIMIT_EXCEEDED')) {
            toast({
                variant: 'destructive',
                title: 'API Quota Exceeded',
                description: "You've reached the daily limit for the free tier. Please try again tomorrow.",
            });
        } else {
            toast({ variant: 'destructive', title: 'Error getting model answer' });
        }
    } finally {
        setIsAnswering(false);
    }
};


  const handleGetFeedback = async () => {
    if (!activeInterview) return;
    setIsGettingFeedback(true);
    try {
        const answeredQuestions = activeInterview.questions.filter(q => q.userAnswer);
        if (answeredQuestions.length === 0) {
            // This case is handled in the JSX now
            return;
        }

        const result = await getInterviewFeedback({
            jobRole: activeInterview.jobRole,
            userAnswers: answeredQuestions.map(q => ({ question: q.question, answer: q.userAnswer }))
        });

        const updatedInterview = { ...activeInterview, feedback: result.feedback };
        updateActiveInterviewInStorage(updatedInterview);

        // append feedback message and auto-scroll to it
        setMessages(prev => [...prev, { role: 'bot', content: result.feedback }]);
        autoScrollRef.current = true;
    } catch(e) {
        if (e instanceof Error && (e.message.includes('RATE_LIMIT_EXCEEDED'))) {
            toast({
                variant: 'destructive',
                title: 'API Quota Exceeded',
                description: "You've reached the daily limit for the free tier. Please try again tomorrow.",
            });
        } else {
            toast({ variant: 'destructive', title: 'Error getting feedback' });
        }
    } finally {
        setIsGettingFeedback(false);
    }
  };

  const handleRenameInterview = (id: string) => {
    if (!renameValue) return;
    const updated = interviews.map(i => i.id === id ? { ...i, name: renameValue } : i);
    saveInterviews(updated, activeInterview?.id === id ? { ...activeInterview, name: renameValue } : activeInterview);
    setIsRenameDialogOpen(false);
    setRenameValue('');
  };

  const deleteInterview = (id: string) => {
  const updated = interviews.filter(i => i.id !== id);

  // Always save the updated list before doing anything else
  saveInterviews(updated, activeInterview?.id === id ? null : activeInterview);

  if (activeInterview?.id === id) {
    // Refresh only if the deleted one was active
    window.location.reload();
  }
};


  const isInterviewOver = activeInterview && currentQuestionIndex >= activeInterview.questions.length;
  const hasAnswers = activeInterview?.questions.some(q => q.userAnswer);


  // Called when user scrolls the messages viewport: update autoScrollRef
  const handleMessagesScroll = () => {
    const el = messagesViewportRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const shouldShowButton = distanceFromBottom > AUTO_SCROLL_THRESHOLD_PX;
    if (shouldShowButton !== showScrollButton) {
      setShowScrollButton(shouldShowButton);
    }
    autoScrollRef.current = distanceFromBottom < AUTO_SCROLL_THRESHOLD_PX;
  };
  
  const handleScrollToBottom = () => {
    const el = messagesViewportRef.current;
    if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!activeInterview) {
      setMessages([]);
      setCurrentQuestionIndex(0);
    }
  }, [activeInterview]);

  return (
    <div className="grid h-[calc(100vh-5rem)] gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Interview Prep Coach</CardTitle>
                <CardDescription>Start a new mock interview session.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleStartInterview)} className="space-y-4">
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
                    {interviews.map(interview => (
                    <li key={interview.id} className='group'>
                        <div
                            role="button"
                            onClick={() => handleSelectInterview(interview)}
                            className={cn(
                                'flex items-center justify-between w-full rounded-md p-2 text-left h-auto hover:bg-accent cursor-pointer',
                                activeInterview?.id === interview.id ? 'bg-secondary' : 'bg-transparent'
                            )}
                        >
                            <div className='flex-1 truncate pr-2'>
                                <p className='font-semibold truncate'>{interview.name}</p>
                                <p className='text-xs text-muted-foreground'>{new Date(interview.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Dialog open={isRenameDialogOpen && activeInterview?.id === interview.id} onOpenChange={(open) => { if(!open) setRenameValue(''); setIsRenameDialogOpen(open);}}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => {e.stopPropagation(); handleSelectInterview(interview); setRenameValue(interview.name); setIsRenameDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Rename Interview</DialogTitle></DialogHeader>
                                        <Input value={renameValue} onChange={e => setRenameValue(e.target.value)} placeholder="Enter new name" />
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                            <Button onClick={() => handleRenameInterview(interview.id)}>Save</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Delete Interview?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>This will permanently delete "{interview.name}".</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteInterview(interview.id)} className='bg-destructive hover:bg-destructive/90'>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </li>
                    ))}
                </ul>
              </ScrollArea>
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8 flex flex-col h-full min-h-0">
        {!activeInterview ? (
             <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                    Your mock interview will appear here.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Start a new session or select a past one to review.
                </p>
            </div>
        ) : (
          <Card className="flex flex-col h-full min-h-0">
            <CardHeader>
                <CardTitle>{activeInterview.name}</CardTitle>
                <CardDescription>Question {Math.min(currentQuestionIndex + 1, activeInterview.questions.length)} of {activeInterview.questions.length}</CardDescription>
            </CardHeader>

            <CardContent className='flex-1 min-h-0 p-0 relative'>
              {showScrollButton && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-4 right-4 z-10 rounded-full"
                        onClick={handleScrollToBottom}
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                )}
              <div
                ref={messagesViewportRef}
                onScroll={handleMessagesScroll}
                className="h-full overflow-auto p-6 space-y-6"
                aria-live="polite"
              >
                {isLoading && <Skeleton className="h-24 w-full" />}
                {messages.map((message, index) => (
                    <div key={index} className={cn('flex items-start gap-3', message.role === 'user' && 'justify-end')}>
                         {message.role === 'bot' && <Bot className='h-6 w-6 text-primary shrink-0' />}
                         <div className={cn('rounded-lg p-3 max-w-[80%] text-sm',
                           message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                           message.isModelAnswer && 'bg-accent/20 border border-accent/50'
                         )}>
                             {message.isModelAnswer && <p className='font-semibold mb-1'>Model Answer:</p>}
                            <p className='whitespace-pre-line'>{message.content}</p>
                         </div>
                         {message.role === 'user' && <User className='h-6 w-6 shrink-0' />}
                    </div>
                ))}
                {(isGettingFeedback || isAnswering) && <div className='flex justify-center'><Loader2 className="h-6 w-6 animate-spin" /></div>}
              </div>
            </CardContent>

            {!activeInterview.feedback && (
                <CardFooter className='border-t pt-6'>
                    {isInterviewOver ? (
                        <>
                        {hasAnswers ? (
                             <Button onClick={handleGetFeedback} disabled={isGettingFeedback} className='w-full'>
                                {isGettingFeedback ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Get Feedback
                             </Button>
                        ) : (
                            <p className="w-full text-center text-sm text-muted-foreground">
                                No answers were provided to give feedback on.
                            </p>
                        )}
                        </>
                    ) : (
                        <div className="w-full space-y-4">
                            <Textarea 
                                placeholder="Type your answer here..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                disabled={isAnswering}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (userInput.trim()) handleNextQuestion();
                                    }
                                }}
                                className="h-36"
                            />
                            <div className='flex justify-between gap-4'>
                                 <Dialog open={isModelAnswerDialogOpen} onOpenChange={setIsModelAnswerDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" disabled={isAnswering}>
                                            <Bot className="mr-2 h-4 w-4" />
                                            Get Model Answer
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Customize Model Answer</DialogTitle>
                                            <DialogDescription>
                                                Add any notes or context for the AI to consider when generating the answer.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className='space-y-2 py-4'>
                                          <Label htmlFor='model-answer-context'>Optional Context</Label>
                                           <Textarea 
                                             id='model-answer-context'
                                             placeholder='e.g., "I have no direct experience in this area" or "Focus on my academic projects."'
                                             value={modelAnswerContext}
                                             onChange={(e) => setModelAnswerContext(e.target.value)}
                                             className='min-h-[100px]'
                                            />
                                        </div>
                                        <DialogFooter>
                                           <DialogClose asChild>
                                             <Button variant="outline">Cancel</Button>
                                           </DialogClose>
                                           <Button onClick={handleGetModelAnswer} disabled={isAnswering}>
                                            {isAnswering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                             Generate
                                           </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button onClick={handleNextQuestion} disabled={!userInput.trim() || isAnswering}>
                                    Submit Answer
                                     <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardFooter>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

