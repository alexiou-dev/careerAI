'use client';

import { useResumeStore } from '@/hooks/use-resume-store';
import { ResumeCard } from '@/components/resume-history/resume-card';
import { RenameResumeDialog } from '@/components/resume-history/rename-resume-dialog';
import { useState } from 'react';
import { Resume } from '@/types';
import { FileText } from 'lucide-react';

export default function ResumeHistoryPage() {
  const { resumes, isLoaded, renameResume, deleteResume } = useResumeStore();
  const [renameTarget, setRenameTarget] = useState<Resume | null>(null);

  if (!isLoaded) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resume History</h1>
          <p className="text-muted-foreground">
            Here are your previously tailored resumes.
          </p>
        </div>
        {resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Resumes Saved</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tailor a resume in the "Resume Tailor" tab to see it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onRename={() => setRenameTarget(resume)}
                onDelete={() => deleteResume(resume.id)}
              />
            ))}
          </div>
        )}
      </div>
      <RenameResumeDialog
        resume={renameTarget}
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        onRename={(id, newTitle) => {
          renameResume(id, newTitle);
          setRenameTarget(null);
        }}
      />
    </>
  );
}
