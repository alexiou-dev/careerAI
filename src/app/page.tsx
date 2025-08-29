'use client';

import { useAuth } from './(main)/auth-provider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPage from './(main)/dashboard/page';
import LoginPage from './login/page';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === undefined) return; // Wait for auth status
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Render a loading state or nothing while redirecting
  return null;
}
