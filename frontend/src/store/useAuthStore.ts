'use client';

import { create } from 'zustand';
import type { AuthUser } from '@/types';
import { clearStoredSessionUser, getStoredSessionUser, setStoredSessionUser } from '@/lib/auth';

interface AuthState {
  currentUser: AuthUser | null;
  isHydrated: boolean;
  hydrate: () => void;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isHydrated: false,
  hydrate: () =>
    set({
      currentUser: getStoredSessionUser(),
      isHydrated: true,
    }),
  signIn: (user: AuthUser) => {
    setStoredSessionUser(user);
    set({ currentUser: user });
  },
  signOut: () => {
    clearStoredSessionUser();
    set({ currentUser: null });
  },
}));