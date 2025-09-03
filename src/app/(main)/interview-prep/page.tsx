'use client';

import { useState, useRef, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react';
import { conductInterview, type InterviewMessage } from '@/ai/flows/interview-prep';
import { InterviewPrepFormSchema, type InterviewPrepFormValues } from '@/types/ai-interview';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


export default function InterviewPrepPage() {
  const [conversation, setConversation] = useState<InterviewMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentJobRole, setCurrentJobRole] = useState('');
  const [currentJobDescription, setCurrentJobDescription] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<InterviewPrepFormValues>({
    resolver: zodResolver(InterviewPrepFormSchema),
    defaultValues: {
      jobRole: '',
      jobDescription: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversation]);

  async function handleStartInterview(values: InterviewPrepFormValues) {
    setIsLoading(true);
    setConversation([]);
    setCurrentJobRole(values.jobRole);
    setCurrentJobDescription(values.jobDescription || '');
    try {
      const result = await conductInterview({
        jobRole: values.jobRole,
        jobDescription: values.jobDescription,
        history: [],
      });
      setConversation([{ role: 'model', content: result.response }]);
      setIsStarted(true);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error starting interview',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendAnswer() {
    if (!userAnswer.trim()) return;

    const newHistory: InterviewMessage[] = [
      ...conversation,
      { role: 'user', content: userAnswer },
    ];
    setConversation(newHistory);
    setUserAnswer('');
    setIsLoading(true);

    try {
      const result = await conductInterview({
        jobRole: currentJobRole,
        jobDescription: currentJobDescription,
        history: newHistory,
      });
       setConversation(prev => [...prev, { role: 'model', content: result.response }]);
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error continuing interview',
            description: 'Something went wrong. Please try again.',
        });
        setConversation(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Could you please try your answer again?" }]);
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <div className="grid h-[calc(100vh-5rem)] gap-8 md:grid-cols-3">
        <Card className="col-span-1 flex flex-col">
            <CardHeader>
                <CardTitle>Interview Prep Coach</CardTitle>
                <CardDescription>
                Mock interview Q&A with an AI, tailored to the role.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleStartInterview)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="jobRole"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Role</FormLabel>
                                <FormControl>
                                <Input
                                    placeholder="e.g., Product Manager"
                                    {...field}
                                    disabled={isStarted}
                                />
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
                                <FormLabel>Job Description (Optional)</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Paste the job description for more tailored questions."
                                    className="min-h-[100px]"
                                    {...field}
                                    disabled={isStarted}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className='flex gap-2'>
                          <Button type="submit" disabled={isLoading || isStarted} className="w-full">
                            {isLoading && !isStarted ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Start Interview
                          </Button>
                          {isStarted && (
                              <Button variant="outline" onClick={() => setIsStarted(false)} className="w-full">
                                  New Interview
                              </Button>
                          )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>

      <Card className="col-span-2 flex flex-col">
         <CardHeader>
            <CardTitle>Mock Interview</CardTitle>
            <CardDescription>
              The AI will ask you questions one by one.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
                 <div className="space-y-4 pr-4">
                    {!isStarted && (
                         <div className="flex h-full min-h-[300px] flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
                            <Bot className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-4 text-sm text-muted-foreground">
                                Your mock interview will begin here.
                            </p>
                        </div>
                    )}
                    {conversation.map((message, index) => (
                        <div
                        key={index}
                        className={cn(
                            'flex items-start gap-3',
                            message.role === 'user' && 'justify-end'
                        )}
                        >
                        {message.role === 'model' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback><Bot size={20} /></AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            'max-w-[80%] rounded-lg p-3 text-sm',
                            message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                        >
                            {message.content}
                        </div>
                         {message.role === 'user' && (
                            <Avatar className="h-8 w-8">
                                 <AvatarFallback><User size={20} /></AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                    ))}
                    {isLoading && isStarted && (
                        <div className='flex items-start gap-3'>
                            <Avatar className="h-8 w-8">
                                <AvatarFallback><Bot size={20} /></AvatarFallback>
                            </Avatar>
                            <div className='bg-muted rounded-lg p-3'>
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
             <div className="relative">
                <Textarea
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendAnswer();
                        }
                    }}
                    disabled={!isStarted || isLoading}
                    className="pr-16"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8"
                    disabled={!isStarted || isLoading || !userAnswer.trim()}
                    onClick={handleSendAnswer}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
