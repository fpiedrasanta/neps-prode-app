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

    const init = async (retry = 0) => {
      try {
        const response = await api.post('auth/refresh-token');
        const { token, user } = response.data;

        if (mounted) {
          setAccessToken(token, user);
        }

        // ✅ Solo marcamos initialized cuando termina BIEN
        if (mounted) {
          setInitialized();
        }

      } catch {
        if (retry < 2) {
          // 🔁 Reintento corto (evita race conditions al levantar la app)
          setTimeout(() => init(retry + 1), 500);
          return;
        }

        if (mounted) {
          logout(false);
          setInitialized(); // ✅ Importante: no dejar la app colgada
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [setAccessToken, logout, setInitialized]);
};