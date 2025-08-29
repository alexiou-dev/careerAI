'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

// This page is a guard. It ensures that unauthenticated users are redirected to login,
// and authenticated users are sent to the dashboard.
export default function MainPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Render nothing, or a loading spinner, as the redirect will happen quickly.
  return null;
}
