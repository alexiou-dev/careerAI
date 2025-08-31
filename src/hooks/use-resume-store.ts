import { useState, useEffect } from 'react';

export type Resume = {
  id: string;
  name: string;
  content: string;
  createdAt: number;
};

export function useResumeStore() {
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('resumes');
    if (stored) setResumes(JSON.parse(stored));
  }, []);

  const saveResume = (resume: Resume) => {
    const updated = [...resumes, resume];
    setResumes(updated);
    localStorage.setItem('resumes', JSON.stringify(updated));
  };

  const deleteResume = (id: string) => {
    const updated = resumes.filter(r => r.id !== id);
    setResumes(updated);
    localStorage.setItem('resumes', JSON.stringify(updated));
  };

  const renameResume = (id: string, newName: string) => {
    const updated = resumes.map(r => r.id === id ? { ...r, name: newName } : r);
    setResumes(updated);
    localStorage.setItem('resumes', JSON.stringify(updated));
  };

  return { resumes, saveResume, deleteResume, renameResume };
}
