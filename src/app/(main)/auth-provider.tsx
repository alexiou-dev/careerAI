'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking auth status from a token
    const token = sessionStorage.getItem('auth-token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === '/login';
    
    if (!isAuthenticated && !isAuthPage) {
      router.push('/login');
    } else if (isAuthenticated && isAuthPage) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = () => {
    sessionStorage.setItem('auth-token', 'true');
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const logout = () => {
    sessionStorage.removeItem('auth-token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const value = { isAuthenticated, login, logout };
  
  const isAuthPage = pathname === '/login';

  // Show a loading state or nothing while we determine auth status
  if (isLoading) {
    return null; 
  }

  // If we are on the login page, render it directly without the main app layout.
  // The main app content is handled within the `(main)` route group.
  if (isAuthPage) {
     return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
     )
  }

  // If authenticated and not on the login page, render the children which will be the main app layout
  if (isAuthenticated) {
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  // This case handles the initial redirect, but children shouldn't be rendered.
  return null;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
