'use client';

/**
 * Authentication Provider & Context
 * 
 * Provides centralized authentication management for the CareerAI application.
 * Integrates with Supabase Auth for user session management, authentication flows,
 * and secure API access.
 * 
 * Features:
 * - User session persistence and state management
 * - Login, signup, logout, and account deletion flows
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';


type AuthContextType = {
  // Raw Supabase user object (null if not authenticated)
  user: any | null;
  userEmail: string | null;
  
  // Client-side login (creates a Supabase session)
  // Authenticates user with email/password
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  // Registers new user via API endpoint
  signup: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  // Signs out user and clears session
  logout: () => Promise<void>;
  // Account deletion
  deleteAccount: (confirmation: string) => Promise<string>;
  // Loading state during auth initialization
  isLoading: boolean;
};

/**
 * React Context that holds authentication state\
 * Initialized as null\\
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider Component
 * 
 * Wraps the application with authentication context and manages:
 * - Initial user session restoration
 * - Real-time auth state changes
 * - Loading state management
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State Management
  const [user, setUser] = useState<any | null>(null);  // Supabase user object
  const [isLoading, setIsLoading] = useState(true);    // Initial auth loading state
  const router = useRouter();                          // Next.js navigation router

  /**
   * Authentication Initialization Effect
   * 
   * Runs once on component mount to:
   * 1. Restore user session from Supabase
   * 2. Subscribe to real-time auth state changes
   */
  useEffect(() => {
    const initAuth = async () => {
      // Fetch current user session from Supabase
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setIsLoading(false); // Auth state is now initialized
    };

    initAuth(); // Initialize auth state

     /**
     * Auth State Change Listener
     * Triggered when:
     * - User signs in or out
     * - Session is refreshed or expires
     * Keeps React state aligned with Supabase internal state.
     */
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null); // Update user state on any auth change
    });

    // Cleanup: unsubscribe from auth state changes to prevent memory leaks
    return () => listener.subscription.unsubscribe();
  }, []);

  /**
   * Login Method
   * 
   * Authenticates user with email and password using Supabase.
   * Includes user-friendly error handling and state updates.
   * {string} email - User's email address
   * {string} password - User's password
   * {Promise<{success: boolean, message: string}>} Authentication result
   */
  const login = async (email: string, password: string) => {
    try {
      // Attempt authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // Handle authentication errors
      if (error) {
        // User-friendly error message for invalid credentials
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, message: 'Invalid email or password.' };
        }
        // Forward other Supabase errors
        return { success: false, message: error.message };
      }

      if (!data.user) {
        return { success: false, message: 'No account found with this email.' };
      }

      // Update local state with authenticated user
      setUser(data.user);
      return { success: true, message: '' }; // Empty message on success
    } catch (err: any) {
      // Catch unexpected errors (network issues, etc.)
      return { success: false, message: err.message };
    }
  };

  /**
   * Signup Method
   * 
   * Registers new user via custom API endpoint 
   * email - New user's email address
   * password - New user's password
   *{Promise<{success: boolean, message: string}>} Registration result
   */
  const signup = async (email: string, password: string) => {
    try {
      // Call custom signup API endpoint
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return data; // Return API response
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  /**
   * Logout Method
   * 
   * Signs out user from Supabase and clears local auth state.
   * Redirects to login page after successful logout.
   */
  const logout = async () => {
    await supabase.auth.signOut();  // Clear Supabase session
    setUser(null);                   // Clear local user state
    router.push('/login');           // Redirect to login page
  };

  const deleteAccount = async (confirmation: string) => {
  if (!user) {
    return 'No authenticated user.';
  }

  try {
    const res = await fetch('/api/account/delete', {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({userId: user.id,confirmation,}),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return data.error || 'Account deletion failed.';
    }

    // Only log out AFTER confirmed deletion
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');

    return 'Account deleted successfully.';
  } catch (err: any) {
    return err.message || 'Unexpected error during account deletion.';
  }
};
  
  /**
   Provides authentication state and methods to children.
   */
  return (
    <AuthContext.Provider
      value={{
        user,
        userEmail: user?.email ?? null,
        login,
        signup,
        logout,
        deleteAccount,
        isLoading
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

