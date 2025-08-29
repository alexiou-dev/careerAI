'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Job, JobStatus } from '@/types';

const STORE_KEY = 'careerai-jobs';

export function useJobStore() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORE_KEY);
      if (items) {
        setJobs(JSON.parse(items));
      }
    } catch (error) {
      console.error('Failed to load jobs from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(jobs));
      } catch (error) {
        console.error('Failed to save jobs to localStorage', error);
      }
    }
  }, [jobs, isLoaded]);

  const addJob = useCallback((job: Omit<Job, 'id' | 'createdAt' | 'status'>) => {
    const newJob: Job = {
      ...job,
      id: crypto.randomUUID(),
      status: 'Applied',
      createdAt: Date.now(),
    };
    setJobs((prevJobs) => [newJob, ...prevJobs]);
    return newJob;
  }, []);

  const updateJobStatus = useCallback((jobId: string, newStatus: JobStatus) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
  }, []);
  
  const deleteJob = useCallback((jobId: string) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
  }, []);

  return { jobs, addJob, updateJobStatus, deleteJob, isLoaded };
}
