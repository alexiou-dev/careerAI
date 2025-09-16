'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '../ui/button';
import type { SavedResume } from '@/types';
import { jsPDF } from 'jspdf';
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

interface ViewResumeDialogProps {
  resume: SavedResume | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewResumeDialog({ resume, isOpen, onClose }: ViewResumeDialogProps) {
  if (!resume) return null;

  // PDF Download
  const handleDownloadPdf = (content: string) => {
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);

      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      let y = margin;

      const lines = doc.splitTextToSize(content, doc.internal.pageSize.width - margin * 2);
      lines.forEach((line: string) => {
        if (y + 5 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 5;
      });

      doc.save(`${resume.name}.pdf`);
      toast({ title: 'Downloading PDF...' });
    } catch (e) {
      console.error('Failed to generate PDF', e);
      toast({
        variant: 'destructive',
        title: 'Error generating PDF',
        description: 'Something went wrong while creating the PDF.',
      });
    }
  };

  // Word Download
  const handleDownloadWord = (content: string) => {
    try {
      const sections: (Paragraph | TextRun)[] = [];
      const lines = content.split('\n');

      lines.forEach(line => {
        if (line.trim() === '') {
          sections.push(new Paragraph(''));
        } else if (line.startsWith('• ')) {
          sections.push(
            new Paragraph({
              text: line.substring(2),
              bullet: { level: 0 },
            })
          );
        } else if (line === line.toUpperCase() && line.length > 2) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: line, bold: true })],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 120 },
            })
          );
        } else {
          sections.push(new Paragraph(line));
        }
      });

      const doc = new Document({
        sections: [{ children: sections as Paragraph[] }],
        styles: {
          paragraphStyles: [
            {
              id: 'HEADING_1',
              name: 'Heading 1',
              basedOn: 'Normal',
              next: 'Normal',
              run: { bold: true, size: 24 },
              paragraph: { spacing: { after: 120 } },
            },
          ],
        },
      });

      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${resume.name}.docx`);
        toast({ title: 'Downloading Word document...' });
      });
    } catch (e) {
      console.error('Failed to generate Word document', e);
      toast({
        variant: 'destructive',
        title: 'Error generating Word document',
        description: 'Something went wrong while creating the file.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{resume.name}</DialogTitle>
          <DialogDescription>
            Review the tailored resume and the original job description.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="flex flex-col gap-2 min-h-0">
            <h3 className="font-semibold">Original Job Description</h3>
            <ScrollArea className="flex-1 min-h-0 rounded-md border p-4 bg-muted/30">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                {resume.jobDescription}
              </pre>
            </ScrollArea>
          </div>

          <div className="flex flex-col gap-2 min-h-0">
            <h3 className="font-semibold">Tailored Resume</h3>
            <ScrollArea className="flex-1 min-h-0 rounded-md border p-4 bg-muted/30">
              <pre className="text-sm whitespace-pre-wrap font-sans">{resume.tailoredResume}</pre>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <Button onClick={() => handleDownloadPdf(resume.tailoredResume)}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button onClick={() => handleDownloadWord(resume.tailoredResume)}>
            <Download className="mr-2 h-4 w-4" /> Word
          </Button>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
