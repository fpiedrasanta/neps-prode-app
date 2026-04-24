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
  setToken: (token: string, userId: string, user?: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  userId: localStorage.getItem("userId"),
  user: null,
  setToken: (token: string, userId: string, user?: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    set({ token, userId, user: user || null });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    set({ token: null, userId: null, user: null });
  },
}));
