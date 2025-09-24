'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bot, Loader2, Sparkles, User, Send, ArrowDown, Mic, MicOff, RefreshCw } from 'lucide-react';
import { type StoredInterview, type ChatMessage } from '@/types/ai-interview';
import { cn } from '@/lib/utils';
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

interface InterviewChatProps {
    activeInterview: StoredInterview | null;
    messages: ChatMessage[];
    currentQuestionIndex: number;
    isAnswering: boolean;
    isGettingFeedback: boolean;
    isRecording: boolean;
    userInput: string;
    onUserInput: (input: string) => void;
    onNextQuestion: () => void;
    onGetModelAnswer: (context: string) => void;
    onGetFeedback: () => void;
    onToggleRecording: () => void;
    onPracticeAgain: () => void;
    onMessagesUpdate: (messages: ChatMessage[]) => void;
}

export function InterviewChat({
    activeInterview,
    messages,
    currentQuestionIndex,
    isAnswering,
    isGettingFeedback,
    isRecording,
    userInput,
    onUserInput,
    onNextQuestion,
    onGetModelAnswer,
    onGetFeedback,
    onToggleRecording,
    onPracticeAgain,
    onMessagesUpdate,
}: InterviewChatProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [modelAnswerContext, setModelAnswerContext] = useState('');
  const [isModelAnswerDialogOpen, setIsModelAnswerDialogOpen] = useState(false);

  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef<boolean>(true);
  const AUTO_SCROLL_THRESHOLD_PX = 150;

  useEffect(() => {
    const el = messagesViewportRef.current;
    if (!el) return;
    if (autoScrollRef.current) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [messages]);

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

  const handleGetModelAnswerClick = () => {
    onGetModelAnswer(modelAnswerContext);
    setIsModelAnswerDialogOpen(false);
    setModelAnswerContext('');
  }

  if (!activeInterview) {
    return (
         <div className="lg:col-span-8 flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
            <Bot className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
                Your mock interview will appear here.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
                Start a new session or select a past one to review.
            </p>
        </div>
    );
  }
  
  const isInterviewOver = currentQuestionIndex >= activeInterview.questions.length;
  const hasAnswers = activeInterview.questions.some(q => q.userAnswer);

  return (
    <div className="lg:col-span-8 flex flex-col h-full min-h-0">
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

            <CardFooter className='border-t pt-6'>
                {activeInterview.feedback ? (
                    <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
                       <p className='text-sm text-muted-foreground'>Interview complete. Review your feedback above.</p>
                       <Button onClick={onPracticeAgain}>
                         <RefreshCw className="mr-2 h-4 w-4" />
                         Practice Again
                       </Button>
                    </div>
                ) : isInterviewOver ? (
                    <>
                    {hasAnswers ? (
                         <Button onClick={onGetFeedback} disabled={isGettingFeedback} className='w-full'>
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
                        <div className="relative">
                            <Textarea 
                                placeholder={isRecording ? 'Recording your answer...' : 'Type or record your answer here...'}
                                value={userInput}
                                onChange={(e) => onUserInput(e.target.value)}
                                disabled={isAnswering}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (userInput.trim()) onNextQuestion();
                                    }
                                }}
                                className="h-36 pr-12"
                            />
                            <Button
                                type="button"
                                variant={isRecording ? "destructive" : "outline"}
                                size="icon"
                                className="absolute right-2 top-2 h-8 w-8"
                                onClick={onToggleRecording}
                                disabled={isAnswering}
                            >
                                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                        </div>
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
                                       <Button onClick={handleGetModelAnswerClick} disabled={isAnswering}>
                                        {isAnswering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                         Generate
                                       </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button onClick={onNextQuestion} disabled={!userInput.trim() || isAnswering}>
                                Submit Answer
                                 <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardFooter>
        </Card>
    </div>
  );
}
