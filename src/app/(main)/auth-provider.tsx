'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const router = useRouter();
  const { addUser, findUser, isLoaded: isUserStoreLoaded } = useUserStore();

  useEffect(() => {
    // This effect now runs only on the client after the component has mounted
    // and after the user store has loaded its data from localStorage.
    if (isUserStoreLoaded) {
      try {
        const sessionToken = sessionStorage.getItem('auth-token');
        if (sessionToken && findUser({ email: sessionToken })) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Could not access sessionStorage:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); // Finished loading auth state
      }
    }
  }, [isUserStoreLoaded, findUser]);

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
  
  // While loading, we can return null or a loading spinner for the children
  // to prevent rendering content that depends on the auth state.
  // The main RootPage will show a skeleton, so returning children is fine.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

