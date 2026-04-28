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
  user: User | null;
  isInitialized: boolean;

  setAccessToken: (token: string, user: User) => void;
  logout: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isInitialized: false,

  setAccessToken: (token, user) => {
    set({ token, user });
  },

  logout: () => {
    set({ token: null, user: null });
  },

  setInitialized: () => set({ isInitialized: true }),
}));