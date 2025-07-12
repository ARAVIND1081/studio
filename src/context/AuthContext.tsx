
'use client';

import type { User } from '@/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'shopSphereCurrentUser_v3';
const CART_STORAGE_KEY_PREFIX = 'shopSphereCart_v3'; // Use prefix for cart keys

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // To prevent flash of wrong UI
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage on initial mount
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      try {
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error parsing stored user from localStorage", error);
        localStorage.removeItem(AUTH_STORAGE_KEY); // Clear corrupted data
      } finally {
        setIsLoading(false);
      }
    } else {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Persist user to localStorage when currentUser changes
    if (typeof window !== 'undefined' && !isLoading) {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [currentUser, isLoading]);

  const clearCartForGuest = () => {
    if (typeof window !== 'undefined') {
        const guestCartKey = `${CART_STORAGE_KEY_PREFIX}_guest`;
        localStorage.removeItem(guestCartKey);
        // This is a bit of a hack to force the cart context to update
        // A better solution might involve a shared event emitter or state management library
        window.dispatchEvent(new Event('storage'));
    }
  };

  const login = (user: User) => {
    // Clear the guest cart before logging in
    clearCartForGuest();
    setCurrentUser(user);
  };

  const logout = () => {
    // The cart context will see the user is null and clear its state.
    setCurrentUser(null);
    router.push('/'); // Redirect to home on logout
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
