'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore, UserCredentials } from '@/hooks/use-user-store';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (credentials: UserCredentials) => Promise<boolean>;
  signup: (credentials: UserCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { users, addUser, findUser, isLoaded: isUserStoreLoaded } = useUserStore();

  useEffect(() => {
    // This effect runs once on mount to check if a user session exists.
    const sessionToken = sessionStorage.getItem('auth-token');
    if (sessionToken && findUser({ email: sessionToken })) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [isUserStoreLoaded, findUser]);

  useEffect(() => {
    // This effect handles routing based on auth state.
    if (isLoading) return;

    const isAuthPage = pathname === '/login';
    
    if (!isAuthenticated && !isAuthPage) {
      router.push('/login');
    } else if (isAuthenticated && isAuthPage) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = useCallback(async (credentials: UserCredentials): Promise<boolean> => {
    const user = findUser(credentials);
    if (user) {
      sessionStorage.setItem('auth-token', user.email);
      setIsAuthenticated(true);
      router.push('/dashboard');
      return true;
    }
    return false;
  }, [findUser, router]);

  const signup = useCallback(async (credentials: UserCredentials): Promise<boolean> => {
    const success = addUser(credentials);
    if (success) {
      sessionStorage.setItem('auth-token', credentials.email);
      setIsAuthenticated(true);
      router.push('/dashboard');
      return true;
    }
    return false;
  }, [addUser, router]);


  const logout = useCallback(() => {
    sessionStorage.removeItem('auth-token');
    setIsAuthenticated(false);
    router.push('/login');
  }, [router]);
  
  const value = { isAuthenticated, login, signup, logout, isLoading };
  
  const isAuthPage = pathname === '/login';

  // Show a loading state or nothing while we determine auth status
  if (isLoading || !isUserStoreLoaded) {
    return null; 
  }

  // If we are on the login page, render it directly without the main app layout.
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

