'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './(main)/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

// This page is the main entry point. It acts as a guard, redirecting users
// based on their authentication status.
export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait until the authentication status is loaded.
    if (!isLoading) {
      if (isAuthenticated) {
        // If authenticated, go to the main dashboard.
        router.replace('/dashboard');
      } else {
        // If not authenticated, go to the login page.
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Render a full-page loading skeleton while checking auth state
  // to prevent flashes of content and provide a better UX.
  return (
    <div className="flex h-screen w-screen items-center justify-center">
       <Skeleton className="h-full w-full" />
    </div>
  );
}
