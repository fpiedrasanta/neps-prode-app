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
  refreshToken: string | null;
  userId: string | null;
  user: User | null;
  setTokens: (token: string, refreshToken: string, userId: string, user?: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  userId: localStorage.getItem("userId"),
  user: null,
  setTokens: (token: string, refreshToken: string, userId: string, user?: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", userId);
    set({ token, refreshToken, userId, user: user || null });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    set({ token: null, refreshToken: null, userId: null, user: null });
  },
}));
