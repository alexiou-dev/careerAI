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
import { Bot, Loader2, Sparkles, User, Trash2, Pencil, Send, Check } from 'lucide-react';
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages])

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

  const handleStartInterview = async (values: InterviewPrepFormValues) => {
    setIsLoading(true);
    setActiveInterview(null);
    setMessages([]);
    
    try {
      const { questions } = await generateInterviewQuestions({
        jobRole: values.jobRole,
        jobDescription: values.jobDescription,
      });

      const newInterview: StoredInterview = {
        id: `interview_${Date.now()}`,
        name: `${values.jobRole} Interview`,
        jobRole: values.jobRole,
        jobDescription: values.jobDescription,
        questions: questions.map(q => ({ question: q, userAnswer: '', modelAnswer: ''})),
        feedback: '',
        createdAt: new Date().toISOString(),
      };
      
      const updatedInterviews = [newInterview, ...interviews];
      saveInterviews(updatedInterviews, newInterview);
      setCurrentQuestionIndex(0);
      setMessages([{ role: 'bot', content: newInterview.questions[0].question }]);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error starting interview' });
    } finally {
      setIsLoading(false);
    }
  };
  
 const handleSelectInterview = (interview: StoredInterview) => {
    setActiveInterview(interview);

    // Reconstruct the chat history
    const reconstructedMessages: ChatMessage[] = [];
    let lastAnsweredIndex = -1;
    interview.questions.forEach((q, index) => {
        reconstructedMessages.push({ role: 'bot', content: q.question });
        if(q.userAnswer) {
            reconstructedMessages.push({ role: 'user', content: q.userAnswer });
            lastAnsweredIndex = index;
        } else if (q.modelAnswer) {
            reconstructedMessages.push({ role: 'bot', content: q.modelAnswer, isModelAnswer: true });
            lastAnsweredIndex = index;
        }
    })

    if (interview.feedback) {
        reconstructedMessages.push({ role: 'bot', content: interview.feedback });
    }
    
    setMessages(reconstructedMessages);

    // Set the current question index to the next one
    const nextQuestion = (lastAnsweredIndex === -1) ? 0 : Math.min(lastAnsweredIndex + 1, interview.questions.length);
    setCurrentQuestionIndex(nextQuestion);
  };
  
  const updateActiveInterviewInStorage = (updatedInterview: StoredInterview) => {
    const updatedInterviews = interviews.map(i => i.id === updatedInterview.id ? updatedInterview : i);
    saveInterviews(updatedInterviews, updatedInterview);
  };
  

  const handleNextQuestion = () => {
    if (!activeInterview) return;

    // Persist the user's answer
    const currentQuestion = activeInterview.questions[currentQuestionIndex];
    if (userInput.trim()) {
        const updatedQuestion: InterviewQuestion = { ...currentQuestion, userAnswer: userInput };
        const updatedQuestions = [...activeInterview.questions];
        updatedQuestions[currentQuestionIndex] = updatedQuestion;
        const updatedInterview: StoredInterview = { ...activeInterview, questions: updatedQuestions };
        
        updateActiveInterviewInStorage(updatedInterview);
        setMessages(prev => [...prev, {role: 'user', content: userInput}]);
    }
    
    setUserInput('');
    setIsAnswering(false);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < activeInterview.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setMessages(prev => [...prev, {role: 'bot', content: activeInterview.questions[nextIndex].question}]);
    } else {
      // Reached the end
      setCurrentQuestionIndex(activeInterview.questions.length);
    }
  };

  const handleGetModelAnswer = async () => {
     if (!activeInterview) return;
     setIsAnswering(true);
     try {
        const currentQuestion = activeInterview.questions[currentQuestionIndex];
        const result = await getExampleAnswer({ jobRole: activeInterview.jobRole, question: currentQuestion.question });
        
        const updatedQuestion = { ...currentQuestion, modelAnswer: result.exampleAnswer };
        const updatedQuestions = [...activeInterview.questions];
        updatedQuestions[currentQuestionIndex] = updatedQuestion;
        const updatedInterview: StoredInterview = { ...activeInterview, questions: updatedQuestions };
        
        updateActiveInterviewInStorage(updatedInterview);
        
        setMessages(prev => [...prev, {role: 'bot', content: result.exampleAnswer, isModelAnswer: true}]);

        // Automatically move to the next question
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < activeInterview.questions.length) {
            setCurrentQuestionIndex(nextIndex);
            setMessages(prev => [...prev, {role: 'bot', content: activeInterview.questions[nextIndex].question}]);
        } else {
            setCurrentQuestionIndex(activeInterview.questions.length);
        }

     } catch (e) {
        toast({ variant: 'destructive', title: 'Error getting model answer' });
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
            toast({ title: "No answers to review", description: "Answer at least one question to get feedback." });
            return;
        }

        const result = await getInterviewFeedback({
            jobRole: activeInterview.jobRole,
            userAnswers: answeredQuestions.map(q => ({ question: q.question, answer: q.userAnswer }))
        });

        const updatedInterview = { ...activeInterview, feedback: result.feedback };
        updateActiveInterviewInStorage(updatedInterview);
        setMessages(prev => [...prev, { role: 'bot', content: result.feedback}]);

    } catch(e) {
        toast({ variant: 'destructive', title: 'Error getting feedback' });
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
    const isDeletingActive = activeInterview?.id === id;
    const updated = interviews.filter(i => i.id !== id);
    if (isDeletingActive) {
        saveInterviews(updated, null);
        setMessages([]);
        setCurrentQuestionIndex(0);
    } else {
        saveInterviews(updated, activeInterview);
    }
  };
  
  const isInterviewOver = activeInterview && currentQuestionIndex >= activeInterview.questions.length;


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
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Start New Interview
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        <Card className="flex flex-col flex-1">
            <CardHeader>
            <CardTitle>Interview History</CardTitle>
            <CardDescription>Review your past sessions.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-2 overflow-y-auto">
            <ScrollArea className="h-full">
                <ul className='space-y-1 pr-2'>
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
      
      <div className="lg:col-span-8">
        {!activeInterview ? (
             <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                    Your mock interview will appear here.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Start a new session or select a past one to begin.
                </p>
            </div>
        ) : (
          <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>{activeInterview.name}</CardTitle>
                <CardDescription>Question {Math.min(currentQuestionIndex + 1, activeInterview.questions.length)} of {activeInterview.questions.length}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-6 overflow-y-auto p-6" ref={scrollAreaRef}>
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
                {isGettingFeedback && <Loader2 className="h-6 w-6 animate-spin self-center" />}

            </CardContent>
            {!activeInterview.feedback && (
                <CardFooter className='border-t pt-6'>
                    {isInterviewOver ? (
                         <Button onClick={handleGetFeedback} disabled={isGettingFeedback} className='w-full'>
                            {isGettingFeedback ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Get Feedback
                         </Button>
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
                            />
                            <div className='flex justify-between gap-4'>
                                <Button variant="ghost" onClick={handleGetModelAnswer} disabled={isAnswering}>
                                  {isAnswering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                                  Get Model Answer
                                </Button>
                                <Button onClick={handleNextQuestion} disabled={!userInput.trim()}>
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
