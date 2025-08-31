'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SavedResume } from '@/types';

const STORE_KEY = 'careerai-resumes';

export function useResumeStore() {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORE_KEY);
      if (items) {
        setResumes(JSON.parse(items));
      }
    } catch (error) {
      console.error('Failed to load resumes from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        const sortedResumes = [...resumes].sort((a, b) => b.createdAt - a.createdAt);
        window.localStorage.setItem(STORE_KEY, JSON.stringify(sortedResumes));
      } catch (error) {
        console.error('Failed to save resumes to localStorage', error);
      }
    }
  }, [resumes, isLoaded]);

  const addResume = useCallback((resume: Omit<SavedResume, 'id' | 'createdAt'>) => {
    const newResume: SavedResume = {
      ...resume,
      id: `${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
    };
    setResumes((prevResumes) => [newResume, ...prevResumes]);
    return newResume;
  }, []);
  
  const deleteResume = useCallback((resumeId: string) => {
    setResumes((prevResumes) => prevResumes.filter((resume) => resume.id !== resumeId));
  }, []);

  const renameResume = useCallback((resumeId: string, newName: string) => {
    setResumes((prevResumes) =>
      prevResumes.map((resume) =>
        resume.id === resumeId ? { ...resume, name: newName } : resume
      )
    );
  }, []);

  return { resumes, addResume, deleteResume, renameResume, isLoaded };
}
