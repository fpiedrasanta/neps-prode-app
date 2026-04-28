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
  // ✅ NUEVO: Estado para saber si ya terminamos de inicializar la autenticacion
  isInitialized: boolean;
  setTokens: (token: string, refreshToken: string, userId: string, user?: User) => void;
  logout: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // ✅ CORRECTO: accessToken SOLAMENTE EN MEMORIA, NUNCA EN localStorage
  token: null,
  // ✅ refreshToken SI se guarda en localStorage (vence en 7 dias)
  refreshToken: localStorage.getItem("refreshToken"),
  userId: localStorage.getItem("userId"),
  user: null,
  isInitialized: false,
  setTokens: (token: string, refreshToken: string, userId: string, user?: User) => {
    // ❌ ELIMINADO: NUNCA guardar access token en localStorage
    // localStorage.setItem("token", token);
    
    // ✅ Solo guardamos refreshToken y userId en localStorage
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", userId);
    
    // ✅ accessToken SOLO queda en la memoria del store
    set({ token, refreshToken, userId, user: user || null });
  },
  logout: () => {
    // ❌ ELIMINADO: token ya no esta en localStorage
    // localStorage.removeItem("token");
    
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    set({ token: null, refreshToken: null, userId: null, user: null });
  },
  setInitialized: () => set({ isInitialized: true }),
}));
