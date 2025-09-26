'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type BankedQuestion } from '@/types/ai-interview';
import { BrainCircuit, Lightbulb, Play, Trash2 } from 'lucide-react';
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

interface QuestionBankTabProps {
  questions: BankedQuestion[];
  onPractice: (question: BankedQuestion) => void;
  onDelete: (id: string) => void;
}

export function QuestionBankTab({ questions, onPractice, onDelete }: QuestionBankTabProps) {
  const getDifficultyColor = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'Hard':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      <ScrollArea className="h-full">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full p-8">
            <BrainCircuit className="h-12 w-12 mb-4" />
            <p className="font-semibold">Your Question Bank is empty.</p>
            <p className="text-sm">
              Save questions from mock interviews to practice them here.
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {questions.map((q) => (
              <AccordionItem value={q.id} key={q.id}>
                <AccordionTrigger className="hover:no-underline text-left">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline">{q.category}</Badge>
                      <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                    </div>
                    <p className="font-semibold">{q.question}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Tips
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {q.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                     <h4 className="font-semibold mb-2">Ideal Answer</h4>
                     <p className="text-sm text-muted-foreground whitespace-pre-wrap">{q.idealAnswer}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this question from your bank?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => onDelete(q.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button size="sm" onClick={() => onPractice(q)}>
                      <Play className="mr-2 h-4 w-4" /> Practice this question
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </ScrollArea>
    </div>
  );
}
