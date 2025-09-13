'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SavedResume } from '@/types';

export function useResumeStore(userId?: string) {
  const STORE_KEY = `careerai-resumes-${userId || 'guest'}`;
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return setIsLoaded(true);
    try {
      const items = window.localStorage.getItem(STORE_KEY);
      if (items) setResumes(JSON.parse(items));
    } catch (error) {
      console.error('Failed to load resumes from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, [STORE_KEY, userId]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      const sorted = [...resumes].sort((a, b) => b.createdAt - a.createdAt);
      window.localStorage.setItem(STORE_KEY, JSON.stringify(sorted));
    } catch (error) {
      console.error('Failed to save resumes to localStorage', error);
    }
  }, [resumes, STORE_KEY, isLoaded]);

  const addResume = useCallback((resume: Omit<SavedResume, 'id' | 'createdAt'>) => {
    const newResume: SavedResume = {
      ...resume,
      id: `${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
    };
    setResumes(prev => [newResume, ...prev]);
    return newResume;
  }, []);

  const deleteResume = useCallback((resumeId: string) => {
    setResumes(prev => prev.filter(r => r.id !== resumeId));
  }, []);

  const renameResume = useCallback((resumeId: string, newName: string) => {
    setResumes(prev => prev.map(r => r.id === resumeId ? { ...r, name: newName } : r));
  }, []);

  return { resumes, addResume, deleteResume, renameResume, isLoaded };
}
