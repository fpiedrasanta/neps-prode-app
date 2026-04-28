// src/core/hooks/useAuthInitializer.ts

import { useEffect, useRef } from "react";
import { api } from "@/core/api/axios";
import { useAuthStore } from "@/core/store/authStore";

export const useAuthInitializer = () => {
  const setAccessToken = useAuthStore(state => state.setAccessToken);
  const logout = useAuthStore(state => state.logout);
  const setInitialized = useAuthStore(state => state.setInitialized);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let mounted = true;

    const init = async () => {
      try {
        const response = await api.post('auth/refresh-token');
        const { token, user } = response.data;

        if (mounted) {
          setAccessToken(token, user);
        }
      } catch {
        if (mounted) {
          logout();
        }
      } finally {
        if (mounted) {
          setInitialized();
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [setAccessToken, logout, setInitialized]);
};