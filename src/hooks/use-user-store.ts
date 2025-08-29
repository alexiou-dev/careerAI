'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';

// NOTE: This is a simulation. In a real app, this would be handled on a secure backend.
// We are not implementing real hashing here for simplicity.
const STORE_KEY = 'careerai-users';

export type UserCredentials = Omit<User, 'id' | 'passwordHash'> & { password?: string };

// Basic "hashing" for demonstration purposes.
// A real application MUST use a strong, salted hashing algorithm (e.g., bcrypt, Argon2).
const fakeHash = (password: string) => `hashed_${password}`;

export function useUserStore() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load users from localStorage on initial client render
    try {
      const items = window.localStorage.getItem(STORE_KEY);
      if (items) {
        setUsers(JSON.parse(items));
      }
    } catch (error) {
      console.error('Failed to load users from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Save users to localStorage whenever they change
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(users));
      } catch (error) {
        console.error('Failed to save users to localStorage', error);
      }
    }
  }, [users, isLoaded]);

  const findUser = useCallback((credentials: UserCredentials): User | undefined => {
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
    if (user && credentials.password) {
        // In a real app, you would compare the hashed password.
        return user.passwordHash === fakeHash(credentials.password) ? user : undefined;
    }
    return user;
  }, [users]);
  
  const addUser = useCallback((credentials: UserCredentials): boolean => {
    if (findUser({email: credentials.email})) {
      return false; // User already exists
    }

    if (!credentials.password) {
      return false; // Password is required for new users
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: credentials.email.toLowerCase(),
      passwordHash: fakeHash(credentials.password),
    };
    setUsers((prevUsers) => [...prevUsers, newUser]);
    return true;
  }, [findUser]);


  return { users, addUser, findUser, isLoaded };
}
