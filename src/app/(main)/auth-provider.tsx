'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  userEmail: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // check for session on mount
  useEffect(() => {
    const token = sessionStorage.getItem('auth-token');
    const email = sessionStorage.getItem('auth-email');
    if (token && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const isAuthPage = pathname === '/login';
    if (!isAuthenticated && !isAuthPage) router.push('/login');
    else if (isAuthenticated && isAuthPage) router.push('/dashboard');
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      sessionStorage.setItem('auth-token', 'dummy-token');
      sessionStorage.setItem('auth-email', email);
      setIsAuthenticated(true);
      setUserEmail(email);
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const exists = users.some((u: any) => u.email === email);
    if (exists) return false;

    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    sessionStorage.setItem('auth-token', 'dummy-token');
    sessionStorage.setItem('auth-email', email);
    setIsAuthenticated(true);
    setUserEmail(email);
    return true;
  };

  const logout = () => {
    sessionStorage.removeItem('auth-token');
    sessionStorage.removeItem('auth-email');
    setIsAuthenticated(false);
    setUserEmail(null);
    router.push('/login');
  };

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, logout, userEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

