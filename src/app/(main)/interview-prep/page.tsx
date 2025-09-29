'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    generateInterviewQuestions,
    getExampleAnswer,
    getInterviewFeedback,
    getInterviewScore,
    analyzeAndBankQuestion,
} from '@/ai/flows/interview-prep';
import {
  InterviewPrepFormSchema,
  type InterviewPrepFormValues,
  type StoredInterview,
  type InterviewQuestion,
  type ChatMessage,
  type BankedQuestion,
} from '@/types/ai-interview';
import { useToast } from '@/hooks/use-toast';
import { InterviewSetup } from '@/components/interview-prep/InterviewSidebar';
import { InterviewChat } from '@/components/interview-prep/InterviewChat';
import { QuestionBankTab } from '@/components/interview-prep/QuestionBankTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const INTERVIEW_STORAGE_KEY = 'interview-history';
const QUESTION_BANK_STORAGE_KEY = 'question-bank';

export default function InterviewPrepPage() {
  const [interviews, setInterviews] = useState<StoredInterview[]>([]);
  const [questionBank, setQuestionBank] = useState<BankedQuestion[]>([]);
  const [activeInterview, setActiveInterview] = useState<StoredInterview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // SpeechRecognition setup
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setUserInput(prev => prev + finalTranscript + interimTranscript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            toast({ variant: 'destructive', title: 'Speech Recognition Error', description: event.error });
            setIsRecording(false);
        };
    }
  }, [toast]);

  useEffect(() => {
    try {
      const storedInterviews = localStorage.getItem(INTERVIEW_STORAGE_KEY);
      if (storedInterviews) {
        setInterviews(JSON.parse(storedInterviews));
      }
      const storedBank = localStorage.getItem(QUESTION_BANK_STORAGE_KEY);
      if (storedBank) {
        setQuestionBank(JSON.parse(storedBank));
      }
    } catch (e) {
      console.error('Failed to load data from storage', e);
    }
  }, []);
  
  const form = useForm<InterviewPrepFormValues>({
    resolver: zodResolver(InterviewPrepFormSchema),
    defaultValues: { jobRole: '', jobDescription: '' },
  });

  const saveToStorage = useCallback((key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Failed to save to ${key}`, e);
    }
  }, []);
  
  const saveInterviews = useCallback((updatedInterviews: StoredInterview[], newActiveInterview?: StoredInterview | null) => {
    setInterviews(updatedInterviews);
    if (newActiveInterview !== undefined) {
        setActiveInterview(newActiveInterview);
    }
    saveToStorage(INTERVIEW_STORAGE_KEY, updatedInterviews);
  }, [saveToStorage]);

  const saveQuestionBank = useCallback((updatedBank: BankedQuestion[]) => {
      setQuestionBank(updatedBank);
      saveToStorage(QUESTION_BANK_STORAGE_KEY, updatedBank);
  }, [saveToStorage]);


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

  const handleStartInterview = async (values: InterviewPrepFormValues, singleQuestion?: string) => {
    setIsLoading(true);
    setActiveInterview(null);
    setMessages([]);

    try {
        let resumePdfDataUri: string | undefined = undefined;
        if (values.resume && values.resume.length > 0) {
            resumePdfDataUri = await fileToDataUri(values.resume[0]);
        }

        let questions: string[];
        if (singleQuestion) {
            questions = [singleQuestion];
        } else {
            const result = await generateInterviewQuestions({
                jobRole: values.jobRole,
                jobDescription: values.jobDescription,
                resumePdfDataUri,
            });
            questions = result.questions;
        }

      const newInterview: StoredInterview = {
        id: `interview_${Date.now()}`,
        name: singleQuestion ? `Practice: ${values.jobRole}` : `${values.jobRole} Interview`,
        jobRole: values.jobRole,
        jobDescription: values.jobDescription,
        resumePdfDataUri: resumePdfDataUri,
        questions: questions.map(q => ({ question: q, userAnswer: '', modelAnswer: ''})),
        feedback: '',
        score: undefined,
        createdAt: new Date().toISOString(),
        modelAnswerContext: '',
      };

      const updatedInterviews = [newInterview, ...interviews];
      
      setCurrentQuestionIndex(0);
      setMessages([{ role: 'bot', content: newInterview.questions[0].question, isQuestion: true }]);
      saveInterviews(updatedInterviews, newInterview);
      
      form.reset();
      // Also reset file input visually if needed
      const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

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
  
  const handlePracticeAgain = (interviewToRetry: StoredInterview) => {
    if (!interviewToRetry) return;

    const newInterview: StoredInterview = {
      id: `interview_${Date.now()}`,
      name: `${interviewToRetry.jobRole} Interview (Practice)`,
      jobRole: interviewToRetry.jobRole,
      jobDescription: interviewToRetry.jobDescription,
      resumePdfDataUri: interviewToRetry.resumePdfDataUri,
      questions: interviewToRetry.questions.map(q => ({ question: q.question, userAnswer: '', modelAnswer: ''})),
      feedback: '',
      score: undefined,
      createdAt: new Date().toISOString(),
      modelAnswerContext: '',
    };

    const updatedInterviews = [newInterview, ...interviews];
    saveInterviews(updatedInterviews, newInterview);
    
    handleSelectInterview(newInterview);
  };

 const handleSelectInterview = (interview: StoredInterview) => {
    setActiveInterview(interview);

    const reconstructedMessages: ChatMessage[] = [];
    let nextQuestionIndex = 0;
    
    if (interview.questions && interview.questions.length > 0) {
      for (let i = 0; i < interview.questions.length; i++) {
        const q = interview.questions[i];
        
        reconstructedMessages.push({ role: 'bot', content: q.question, isQuestion: true });
        
        if (q.userAnswer) {
          reconstructedMessages.push({ role: 'user', content: q.userAnswer });
          nextQuestionIndex = i + 1;
        } else if (q.modelAnswer) {
          reconstructedMessages.push({ role: 'bot', content: q.modelAnswer, isModelAnswer: true });
          nextQuestionIndex = i + 1;
        } else {
          break;
        }
      }
    }

    if (interview.feedback) {
        reconstructedMessages.push({ role: 'bot', content: interview.feedback, isFeedback: true });
    }

    setMessages(reconstructedMessages);

    if (nextQuestionIndex >= interview.questions.length && interview.questions.every(q => q.userAnswer || q.modelAnswer)) {
      setCurrentQuestionIndex(interview.questions.length);
    } else {
      setCurrentQuestionIndex(nextQuestionIndex);
    }
  };

  const updateActiveInterviewInStorage = (updatedInterview: StoredInterview) => {
    const updatedInterviews = interviews.map(i => i.id === updatedInterview.id ? updatedInterview : i);
    saveInterviews(updatedInterviews, updatedInterview);
  };
  
    const handleToggleRecording = () => {
    if (!recognitionRef.current) {
        toast({variant: 'destructive', title: 'Unsupported Browser', description: "Speech recognition is not supported in your browser."})
        return;
    };
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleNextQuestion = () => {
    if (!activeInterview) return;
    
    if (isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
    }

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
      setMessages(prev => [...prev, {role: 'bot', content: activeInterview.questions[nextIndex].question, isQuestion: true}]);
    } else {
      setCurrentQuestionIndex(activeInterview.questions.length);
    }
  };

  const handleGetModelAnswer = async (context: string) => {
    if (!activeInterview) return;
    setIsAnswering(true);
    try {
        const currentQuestion = activeInterview.questions[currentQuestionIndex];

        const accumulatedContext = [
            activeInterview.modelAnswerContext || '',
            context || ''
        ].filter(Boolean).join(' | ');

        const result = await getExampleAnswer({
             jobRole: activeInterview.jobRole,
             question: currentQuestion.question,
             resumePdfDataUri: activeInterview.resumePdfDataUri,
             userContext: accumulatedContext || undefined,
        });

        const updatedQuestion = { ...currentQuestion, modelAnswer: result.exampleAnswer };
        const updatedQuestions = [...activeInterview.questions];
        updatedQuestions[currentQuestionIndex] = updatedQuestion;
        
        const updatedInterview: StoredInterview = {
            ...activeInterview,
            modelAnswerContext: accumulatedContext,
            questions: updatedQuestions
        };

        updateActiveInterviewInStorage(updatedInterview);

        setMessages(prev => [...prev, {role: 'bot', content: result.exampleAnswer, isModelAnswer: true}]);

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < activeInterview.questions.length) {
            setCurrentQuestionIndex(nextIndex);
            setMessages(prev => [...prev, {role: 'bot', content: activeInterview.questions[nextIndex].question, isQuestion: true}]);
        } else {
            setCurrentQuestionIndex(activeInterview.questions.length);
        }

     } catch (e) {
        if (e instanceof Error && (e.message.includes('RATE_LIMIT_EXCEEDED'))) {
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
            return;
        }

        const feedbackInput = {
            jobRole: activeInterview.jobRole,
            userAnswers: answeredQuestions.map(q => ({ question: q.question, answer: q.userAnswer }))
        };

        const [feedbackResult, scoreResult] = await Promise.all([
            getInterviewFeedback(feedbackInput),
            getInterviewScore(feedbackInput)
        ]);

        const updatedInterview = { 
            ...activeInterview, 
            feedback: feedbackResult.feedback, 
            score: scoreResult.score 
        };
        updateActiveInterviewInStorage(updatedInterview);

        setMessages(prev => [...prev, { role: 'bot', content: feedbackResult.feedback, isFeedback: true }]);
    } catch(e) {
        console.error('Error getting feedback:', e);
        if (e instanceof Error && e.message.includes('RATE_LIMIT_EXCEEDED')) {
            toast({
                variant: 'destructive',
                title: 'API Quota Exceeded',
                description: "You've reached the daily limit for the free tier. Please try again tomorrow.",
            });
        } else if (e instanceof Error) {
            toast({ variant: 'destructive', title: 'Error getting feedback', description: e.message });
        } else {
            toast({ variant: 'destructive', title: 'Error getting feedback', description: 'An unknown error occurred.' });
        }
    } finally {
        setIsGettingFeedback(false);
    }
  };

  const handleBankQuestion = async (question: string) => {
    if (questionBank.some(q => q.question === question)) {
        toast({ title: "Already Banked", description: "This question is already in your bank."});
        return;
    }

    toast({ title: "Banking question...", description: "Analyzing and saving to your bank."});
    try {
        const analysis = await analyzeAndBankQuestion({ question });
        const newBankedQuestion: BankedQuestion = {
            id: `banked_${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...analysis
        };
        saveQuestionBank([newBankedQuestion, ...questionBank]);
        toast({ title: "Question Banked!", variant: 'default' });
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error Banking Question' });
    }
  };

  const handleDeleteBankedQuestion = (id: string) => {
    saveQuestionBank(questionBank.filter(q => q.id !== id));
    toast({ title: 'Question removed from bank.' });
  }

  const handleRenameInterview = (id: string, newName: string) => {
    const updated = interviews.map(i => i.id === id ? { ...i, name: newName } : i);
    saveInterviews(updated, activeInterview?.id === id ? { ...activeInterview, name: newName } : activeInterview);
  };

  const deleteInterview = (id: string) => {
    const updated = interviews.filter(i => i.id !== id);
    saveInterviews(updated, activeInterview?.id === id ? null : activeInterview);
    if (activeInterview?.id === id) {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (!activeInterview) {
      setMessages([]);
      setCurrentQuestionIndex(0);
    }
  }, [activeInterview]);
  
    useEffect(() => {
        return () => {
            if (recognitionRef.current && isRecording) {
                recognitionRef.current.stop();
            }
        };
    }, [isRecording]);

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 flex flex-col gap-6">
            <Tabs defaultValue="setup" className="flex flex-col flex-1 min-h-0">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="setup">Interview Setup</TabsTrigger>
                    <TabsTrigger value="bank">Question Bank</TabsTrigger>
                </TabsList>
                <TabsContent value="setup" className="flex-1 flex flex-col min-h-0 mt-4">
                     <InterviewSetup
                        form={form}
                        isLoading={isLoading}
                        interviews={interviews}
                        activeInterview={activeInterview}
                        onStartInterview={(values) => handleStartInterview(values)}
                        onSelectInterview={handleSelectInterview}
                        onRenameInterview={handleRenameInterview}
                        onDeleteInterview={deleteInterview}
                        onPracticeAgain={handlePracticeAgain}
                    />
                </TabsContent>
                <TabsContent value="bank" className="flex-1 min-h-0 mt-4">
                     <QuestionBankTab
                        questions={questionBank}
                        onPractice={(q) => handleStartInterview({ jobRole: q.category }, q.question)}
                        onDelete={handleDeleteBankedQuestion}
                     />
                </TabsContent>
            </Tabs>
        </div>

      <InterviewChat
        activeInterview={activeInterview}
        messages={messages}
        currentQuestionIndex={currentQuestionIndex}
        isAnswering={isAnswering}
        isGettingFeedback={isGettingFeedback}
        isRecording={isRecording}
        userInput={userInput}
        onUserInput={setUserInput}
        onNextQuestion={handleNextQuestion}
        onGetModelAnswer={handleGetModelAnswer}
        onGetFeedback={handleGetFeedback}
        onToggleRecording={handleToggleRecording}
        onPracticeAgain={() => handlePracticeAgain(activeInterview!)}
        onBankQuestion={handleBankQuestion} onMessagesUpdate={function (messages: ChatMessage[]): void {
          throw new Error('Function not implemented.');
        } }      />
    </div>
  );
}

   
    

    
