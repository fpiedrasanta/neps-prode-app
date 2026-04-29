// src/core/hooks/useAuthInitializer.ts
import { useEffect, useRef } from "react";
import { api } from "@/core/api/axios";
import { useAuthStore } from "@/core/store/authStore";

// 🔒 Singleton global
let isInitializing = false;
let initPromise: Promise<void> | null = null;

export const useAuthInitializer = () => {
  const setAccessToken = useAuthStore(state => state.setAccessToken);
  const logout = useAuthStore(state => state.logout);
  const setInitialized = useAuthStore(state => state.setInitialized);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let mounted = true;

    if (!isInitializing) {
      isInitializing = true;

      initPromise = (async () => {
        // 🔥 Delay inicial (clave para PWA / cookies)
        await new Promise(res => setTimeout(res, 300));

        let retry = 0;

        while (retry < 3) {
          try {
            const response = await api.post('auth/refresh-token');
            const { token, user } = response.data;

            if (mounted) {
              setAccessToken(token, user);
            }

            return; // ✅ éxito
          } catch {
            retry++;
            await new Promise(res => setTimeout(res, 500));
          }
        }

        // ❌ Falló después de retries
        if (mounted) {
          logout(false);
        }
      })().finally(() => {
        isInitializing = false;
      });
    }

    // 👇 todos esperan el mismo init
    initPromise?.finally(() => {
      if (mounted) {
        setInitialized();
      }
    });

    return () => {
      mounted = false;
    };
  }, [setAccessToken, logout, setInitialized]);
};