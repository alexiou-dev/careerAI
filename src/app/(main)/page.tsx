'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

/**
 * MainPage Component - Authentication Guard & Router
 * 
 * Purpose:
 * This:
 * 1. Checks user authentication status
 * 2. Redirects authenticated users to /dashboard
 * 3. Redirects unauthenticated users to /login
 */
export default function MainPage() {
  // Hooks initialization
  const router = useRouter();        // Next.js client-side navigation
  const { isAuthenticated } = useAuth(); // Authentication state from context

  useEffect(() => {
    if (isAuthenticated) {
      // Authenticated path: Redirect to main app dashboard
      router.replace('/dashboard');
    } else {
      // Unauthenticated path: Redirect to login page
      router.replace('/login');
    }
  }, [isAuthenticated, router]); // Re-run when auth state changes

  return null; // No UI rendered - immediate redirect
}
