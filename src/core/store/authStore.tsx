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

// Cargar usuario desde localStorage al inicializar
const savedUser = localStorage.getItem('auth_user');
const initialUser = savedUser ? JSON.parse(savedUser) : null;

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: initialUser,
  isInitialized: false,

  setAccessToken: (token, user) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('auth_user');
    set({ token: null, user: null });
  },

  setInitialized: () => set({ isInitialized: true }),
}));
