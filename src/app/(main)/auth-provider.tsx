'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from 'react';

// A simple mock of a user object
interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd verify a token with a backend here.
    // For this mock, we'll check localStorage.
    try {
      const storedUser = window.localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      window.localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, name: string = 'User') => {
    const newUser = { email, name };
    setUser(newUser);
    try {
      window.localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to save user to localStorage', error);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      window.localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to remove user from localStorage', error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, isLoading }}
    >
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
