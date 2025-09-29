'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { type BankedQuestion } from '@/types/ai-interview';

interface QuestionBankTabProps {
  questions: BankedQuestion[];
  onPractice: (question: BankedQuestion) => void;
  onDelete: (id: string) => void;
}

export function QuestionBankTab({ questions, onPractice, onDelete }: QuestionBankTabProps) {
  const getDifficultyColor = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground flex-1">
          <BrainCircuit className="h-12 w-12 mb-4" />
          <p className="font-semibold">Your Question Bank is empty.</p>
          <p className="text-sm">Save questions from mock interviews to practice them here.</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-4 p-2">
            {questions.map(q => (
              <div key={q.id} className="border rounded-md p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary text-white">{q.category}</Badge>
                  <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                </div>
                <p className="font-semibold">{q.question}</p>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" /> Tips
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {q.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Ideal Answer</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{q.idealAnswer}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to remove this question from your bank?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(q.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button size="sm" onClick={() => onPractice(q)}>
                    <Play className="mr-2 h-4 w-4" /> Practice this question
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
