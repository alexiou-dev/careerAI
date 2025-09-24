import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form } from '@/components/ui/form';
import { Sparkles } from 'lucide-react';
import { type StoredInterview, type InterviewPrepFormValues } from '@/types/ai-interview';

type Props = {
  form: any;
  isLoading: boolean;
  interviews: StoredInterview[];
  activeInterview: StoredInterview | null;
  onStartInterview: (values: InterviewPrepFormValues) => void;
  onSelectInterview: (interview: StoredInterview) => void;
  onDeleteInterview: (id: string) => void;
  onRenameInterview: (id: string) => void;
  getSuccessScore: (interview: StoredInterview) => number | null;
};

export function InterviewSidebar({
  form,
  isLoading,
  interviews,
  activeInterview,
  onStartInterview,
  onSelectInterview,
  onDeleteInterview,
  onRenameInterview,
  getSuccessScore,
}: Props) {
  return (
    <>
      {/* Start Interview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Prep Coach</CardTitle>
          <CardDescription>Start a new mock interview session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onStartInterview)} className="space-y-4">
              {/* form fields ... */}
              <Button type="submit" disabled={isLoading} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Start New Interview
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Interview History */}
      <Card className="flex flex-col flex-1 min-h-0">
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
          <CardDescription>Review your past sessions.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-2 min-h-0">
          <ScrollArea className="h-full">
            <ul className="space-y-1 pr-2">
              {interviews.length === 0 && (
                <li className="text-center text-sm text-muted-foreground py-4">
                  No past interviews.
                </li>
              )}
              {/* render list items */}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
