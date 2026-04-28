// src/core/store/authStore.ts

import { create } from "zustand";

interface User {
  id?: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  countryId?: string;
  countryDescription?: string;
  roles?: string[];
  requiresEmailVerification?: boolean;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  user: User | null;
  isInitialized: boolean;

  setAccessToken: (token: string, userId: string, user?: User) => void;
  logout: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  user: null,
  isInitialized: false,

  setAccessToken: (token, userId, user) => {
    set({ token, userId, user: user || null });
  },

  logout: () => {
    set({ token: null, userId: null, user: null });
  },

  setInitialized: () => set({ isInitialized: true }),
}));