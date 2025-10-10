'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Upload, Lightbulb, CheckCircle, X, Trash2, Eye, FileText, Pencil, Clock } from 'lucide-react';
import { analyzeJobSkills } from '@/ai/flows/analyze-skills';
import { useToast } from '@/hooks/use-toast';
import {
  SkillAnalyzerFormSchema,
  type SkillAnalyzerFormValues,
  type SkillAnalysis,
  type StoredRoadmap,
} from '@/types/ai-skills';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';


const ROADMAP_STORAGE_KEY = 'roadmap_history';

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

export const RoadmapContent = ({ content }: { content: string }) => {
  // Split the roadmap into sections by emojis
  const sections = content.split(/(?=🌟|📘|🛠|✅|🧠|🧪)/g);

  return (
    <div className="space-y-2 font-sans text-sm p-4 bg-muted/50 rounded-md">
      {sections.map((section, index) => {
        const trimmed = section.trim();
        if (!trimmed) return null;

        // You can add emoji-based styling
        if (trimmed.startsWith('🌟')) {
          return (
            <div key={index} className="font-semibold text-foreground border-l-2 border-primary pl-2">
              {trimmed}
            </div>
          );
        }
        if (trimmed.startsWith('📘')) {
          return <div key={index} className="pl-4">{trimmed}</div>;
        }
        if (trimmed.startsWith('🛠')) {
          return <div key={index} className="pl-4 italic text-muted-foreground">{trimmed}</div>;
        }
        if (trimmed.startsWith('✅')) {
          return <div key={index} className="pl-4 text-green-700">{trimmed}</div>;
        }
        if (trimmed.startsWith('🧠') || trimmed.startsWith('🧪')) {
          return <div key={index} className="pl-4 text-blue-700">{trimmed}</div>;
        }

        return <div key={index}>{trimmed}</div>;
      })}
    </div>
  );
};


const extractTimeline = (roadmap: string[]): string => {
  const timelineRegex = /Suggested Timeline:\s*(.*)/i;
  for (const stage of roadmap) {
    const lines = stage.split('\n');
    for (const line of lines) {
      const match = line.match(timelineRegex);
      if (match) {
        return match[1].trim();
      }
    }
  }
  return '';
};


const getRoadmapPreview = (roadmap: StoredRoadmap): string => {
  if (!roadmap.analysis.skillGaps || roadmap.analysis.skillGaps.length === 0) {
    return roadmap.analysis.message || 'No specific missing skills identified.';
  }
  const firstRoadmapContent = roadmap.analysis.skillGaps[0].roadmap.join('\n');
  return firstRoadmapContent.split('\n').filter(line => line.trim() !== '').slice(0, 3).join(' ').substring(0, 150) + '...';
};


export default function SkillAnalyzerPage() {
  const [analysisResult, setAnalysisResult] = useState<SkillAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  
  const [savedRoadmaps, setSavedRoadmaps] = useState<StoredRoadmap[]>([]);
  const [viewedRoadmap, setViewedRoadmap] = useState<StoredRoadmap | null>(null);
  const [roadmapToEdit, setRoadmapToEdit] = useState<StoredRoadmap | null>(null);

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveFormValues, setSaveFormValues] = useState({ name: '', priority: 'medium', timeline: '' });


  const saveRoadmapsToStorage = useCallback((roadmaps: StoredRoadmap[]) => {
    try {
      localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(roadmaps));
    } catch (e) {
      console.error('Failed to save roadmaps', e);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ROADMAP_STORAGE_KEY);
      if (stored) {
        setSavedRoadmaps(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load roadmaps from storage', e);
    }
  }, []);

  const form = useForm<SkillAnalyzerFormValues>({
    resolver: zodResolver(SkillAnalyzerFormSchema),
  });

  const fileRef = form.register('resume');

  async function onSubmit(values: SkillAnalyzerFormValues) {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const file = values.resume[0];
      const resumePdfDataUri = await fileToDataUri(file);

      const result = await analyzeJobSkills({
        resumePdfDataUri,
        jobDescription: values.jobDescription,
      });
      setAnalysisResult(result);
      const jobTitle = values.jobDescription.split('\n')[0].substring(0, 50);
      
      let timeline = '';
      if(result.skillGaps && result.skillGaps.length > 0) {
        timeline = extractTimeline(result.skillGaps[0].roadmap);
      }
      
      setSaveFormValues({ name: `Roadmap for ${jobTitle}...`, priority: 'medium', timeline });

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Analyzing Skills',
        description: 'Something went wrong. Please check your inputs and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveRoadmap = () => {
    if (!analysisResult) return;
    const newRoadmap: StoredRoadmap = {
      id: `roadmap_${Date.now()}`,
      name: saveFormValues.name,
      priority: saveFormValues.priority as StoredRoadmap['priority'],
      timeline: saveFormValues.timeline,
      createdAt: new Date().toISOString(),
      analysis: analysisResult,
      jobDescription: form.getValues('jobDescription'),
    };
    const updatedRoadmaps = [newRoadmap, ...savedRoadmaps];
    setSavedRoadmaps(updatedRoadmaps);
    saveRoadmapsToStorage(updatedRoadmaps);
    toast({ title: 'Roadmap Saved!', description: `"${saveFormValues.name}" has been added to your history.` });
    setIsSaveDialogOpen(false);
    setAnalysisResult(null);
    form.reset();
    setFileName('');
  };

  const handleEditRoadmap = () => {
    if (!roadmapToEdit) return;
    const updated = savedRoadmaps.map(r => 
        r.id === roadmapToEdit.id 
        ? { 
            ...r, 
            name: saveFormValues.name,
            priority: saveFormValues.priority as StoredRoadmap['priority'],
            timeline: saveFormValues.timeline
          } 
        : r
    );
    setSavedRoadmaps(updated);
    saveRoadmapsToStorage(updated);
    toast({ title: 'Roadmap Updated' });
    setRoadmapToEdit(null);
  };
  
  const handleDeleteRoadmap = (id: string) => {
    const updated = savedRoadmaps.filter(r => r.id !== id);
    setSavedRoadmaps(updated);
    saveRoadmapsToStorage(updated);
    toast({ title: 'Roadmap Deleted' });
  };
  
    const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    form.setValue('resume', null);
    setFileName('');
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const getPriorityBadgeColor = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      default: return 'hidden';
    }
  };

  const getPriorityText = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return '';
    }
  };

  return (
    <>
      <Tabs defaultValue="analyzer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyzer">Skill Analyzer</TabsTrigger>
          <TabsTrigger value="history">Roadmap History</TabsTrigger>
        </TabsList>
        <TabsContent value="analyzer" className="mt-6">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Skill Gap Analyzer</CardTitle>
                <CardDescription>
                  Upload your resume and paste a job description to identify the key skills you should focus on to land the role.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                          control={form.control}
                          name="resume"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Your Resume (PDF)</FormLabel>
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
                                      <span className="truncate">{fileName || 'Choose a PDF file'}</span>
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
                      <FormField
                          control={form.control}
                          name="jobDescription"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Job Description</FormLabel>
                              <FormControl>
                              <Textarea
                                  placeholder="Paste the full job description here..."
                                  className="min-h-[150px] md:min-h-[200px]"
                                  {...field}
                              />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Analyze Skill Gaps
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
              <div className="flex flex-col">
                  {isLoading && (
                      <Card className="flex h-full flex-col items-center justify-center">
                          <CardContent className="flex flex-col items-center justify-center gap-4 pt-6">
                              <Loader2 className="h-12 w-12 animate-spin text-primary" />
                              <p className="text-muted-foreground">Analyzing your skills...</p>
                          </CardContent>
                      </Card>
                  )}

                  {!isLoading && analysisResult && (
                      <Card>
                          <CardHeader>
                              <CardTitle>Your Personalized Learning Plan</CardTitle>
                              <CardDescription>Based on our analysis, here are the key areas to focus on.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                              {analysisResult.message && (
                                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-green-500/50 bg-green-500/10 p-8 text-center">
                                      <CheckCircle className="h-12 w-12 text-green-500" />
                                      <p className="mt-4 text-base font-medium text-foreground">
                                          {analysisResult.message}
                                      </p>
                                  </div>
                              )}
                              {analysisResult.skillGaps && analysisResult.skillGaps.length > 0 && (
                                  <Accordion type="single" collapsible className="w-full">
                                      {analysisResult.skillGaps.map((gap, index) => (
                                          <AccordionItem value={`item-${index}`} key={index}>
                                              <AccordionTrigger className='text-lg font-semibold text-primary hover:no-underline'>
                                                  {gap.skill}
                                              </AccordionTrigger>
                                              <AccordionContent>
                                                  <RoadmapContent content={gap.roadmap.join('\n')} />
                                              </AccordionContent>
                                          </AccordionItem>
                                      ))}
                                  </Accordion>
                              )}
                          </CardContent>
                          <CardFooter>
                            <Button onClick={() => setIsSaveDialogOpen(true)} disabled={isLoading}>
                              Save Roadmap
                            </Button>
                          </CardFooter>
                      </Card>
                  )}

                  {!isLoading && !analysisResult && (
                      <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
                          <Lightbulb className="h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-lg font-medium text-muted-foreground">
                              Your personalized learning plan will appear here.
                          </p>
                      </div>
                  )}
              </div>
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Roadmap History</CardTitle>
              <CardDescription>View and manage your saved learning roadmaps.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[calc(100vh-22rem)]">
                  {savedRoadmaps.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      <FileText className="mx-auto h-8 w-8 mb-2" />
                      No saved roadmaps yet.
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {savedRoadmaps.map((roadmap) => {
                          const timeline = roadmap.timeline || (roadmap.analysis.skillGaps && roadmap.analysis.skillGaps.length > 0 ? extractTimeline(roadmap.analysis.skillGaps[0].roadmap) : '');
                          const preview = getRoadmapPreview(roadmap);
                          return (
                            <li key={roadmap.id} className="group rounded-md border p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className='flex-1'>
                                        <p className="font-semibold">{roadmap.name}</p>
                                        <div className='flex items-center gap-4 mt-2 flex-wrap'>
                                            <Badge className={getPriorityBadgeColor(roadmap.priority)}>{getPriorityText(roadmap.priority)}</Badge>
                                            {timeline && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{timeline}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewedRoadmap(roadmap)}>
                                          <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setRoadmapToEdit(roadmap); setSaveFormValues({ name: roadmap.name, priority: roadmap.priority || 'medium', timeline: roadmap.timeline || '' }); }}>
                                          <Pencil className="h-4 w-4" />
                                      </Button>
                                      <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                  <Trash2 className="h-4 w-4" />
                                              </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                          <AlertDialogHeader>
                                              <AlertDialogTitle>Delete Roadmap?</AlertDialogTitle>
                                              <AlertDialogDescription>This action cannot be undone. This will permanently delete "{roadmap.name}".</AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteRoadmap(roadmap.id)}>Delete</AlertDialogAction>
                                          </AlertDialogFooter>
                                          </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground italic">
                                        {preview}
                                    </p>
                                </div>
                            </li>
                          )
                      })}
                    </ul>
                  )}
                </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Save / Edit Dialog */}
      <Dialog open={isSaveDialogOpen || !!roadmapToEdit} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setIsSaveDialogOpen(false);
          setRoadmapToEdit(null);
        }
      }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{roadmapToEdit ? 'Edit Learning Roadmap' : 'Save Learning Roadmap'}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className='space-y-2'>
                    <Label htmlFor="roadmap-name">Roadmap Name</Label>
                    <Input id="roadmap-name" value={saveFormValues.name} onChange={(e) => setSaveFormValues(v => ({...v, name: e.target.value}))} />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor="roadmap-priority">Priority</Label>
                     <Select value={saveFormValues.priority} onValueChange={(value) => setSaveFormValues(v => ({...v, priority: value}))}>
                        <SelectTrigger id="roadmap-priority">
                            <SelectValue placeholder="Set priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='space-y-2'>
                    <Label htmlFor="roadmap-timeline">Estimated Timeline</Label>
                    <Input id="roadmap-timeline" value={saveFormValues.timeline} onChange={(e) => setSaveFormValues(v => ({...v, timeline: e.target.value}))} placeholder="e.g., 2-3 weeks" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={roadmapToEdit ? handleEditRoadmap : handleSaveRoadmap}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Dialog */}
      {viewedRoadmap && (
        <Dialog open={!!viewedRoadmap} onOpenChange={() => setViewedRoadmap(null)}>
            <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{viewedRoadmap.name}</DialogTitle>
                    <DialogDescription>
                        Generated on {format(new Date(viewedRoadmap.createdAt), 'PPp')}
                    </DialogDescription>
                </DialogHeader>
                 <ScrollArea className="flex-1 min-h-0 -mx-6 px-6">
                    <div className="space-y-6 p-6 pt-0">
                        {viewedRoadmap.analysis.message && (
                             <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-green-500/50 bg-green-500/10 p-8 text-center">
                                <p className="text-base font-medium text-foreground">{viewedRoadmap.analysis.message}</p>
                            </div>
                        )}
                        {viewedRoadmap.analysis.skillGaps && viewedRoadmap.analysis.skillGaps.length > 0 && (
                            <Accordion type="single" collapsible className="w-full">
                                {viewedRoadmap.analysis.skillGaps.map((gap, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger className='text-lg font-semibold text-primary hover:no-underline'>
                                        {gap.skill}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <RoadmapContent content={gap.roadmap.join('\n')} />
                                    </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </div>
                 </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setViewedRoadmap(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
