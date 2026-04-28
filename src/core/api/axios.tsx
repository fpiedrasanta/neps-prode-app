// src/core/api/axios.ts

import axios from "axios";
import { useAuthStore } from "../store/authStore";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.warn('VITE_API_URL no está configurada. Las peticiones API fallarán.');
}

export const api = axios.create({
  baseURL: baseURL,
});

// Flag para evitar múltiples llamadas simultáneas de refresh
let isRefreshing = false;
// Cola de peticiones pendientes mientras se refresca el token
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = [];

// Función para procesar la cola de peticiones pendientes
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  // ✅ CORRECTO: Tomar accessToken DIRECTAMENTE DEL STORE (MEMORIA)
  // NUNCA MAS de localStorage!
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Contador de errores para prevenir bucles infinitos
const errorCountMap = new Map<string, number>();
const MAX_RETRIES = 3;

// Interceptor de respuesta: Manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    // Resetear contador de errores para esta url si la petición tuvo éxito
    const url = response.config.url || '';
    errorCountMap.delete(url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = error.config?.url || 'unknown';

    // Si es error 401 y no es la petición de refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Evitar bucle en la página de login
      if (window.location.pathname.includes('/login')) {
        return Promise.resolve({ error: true, status: 401 });
      }

      if (isRefreshing) {
        // Si ya estamos refrescando, encolamos esta petición
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      // Si no tenemos refresh token, deslogueamos directamente
      if (!refreshToken) {
        // ✅ Limpiamos TODO correctamente usando el logout oficial del store
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.resolve({ error: true, status: 401 });
      }

      try {
        // Intentar refrescar el token
        const response = await api.post('/api/auth/refresh-token', { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // ✅ NUNCA guardamos accessToken en localStorage
        // El store ya se encarga de guardar solo refreshToken y dejar accessToken SOLO en memoria
        
        // ✅ CORRECCIÓN: Actualizar tambien el store de Zustand (no solo localStorage!)
        const setTokens = useAuthStore.getState().setTokens;
        // Actualizamos token y refreshToken manteniendo el usuario que ya estaba
        const currentState = useAuthStore.getState();
        setTokens(accessToken, newRefreshToken, currentState.userId || '', currentState.user || undefined);
        
        // Actualizar header con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Procesar la cola de peticiones pendientes
        processQueue(null, accessToken);
        
        // Reintentar la petición original
        return api(originalRequest);
        
      } catch (refreshError) {
        // Falló el refresh token, desloguear usuario COMPLETAMENTE
        processQueue(refreshError, null);
        
        // ✅ Usamos logout oficial del store, limpia memoria Y localStorage correctamente
        useAuthStore.getState().logout();
        
        window.location.href = "/login";
        
        return Promise.resolve({ error: true, status: 401 });
      } finally {
        isRefreshing = false;
      }
    }

    // Para el resto de errores, mantener la lógica existente
    // Incrementar contador de errores
    const currentCount = (errorCountMap.get(url) || 0) + 1;
    errorCountMap.set(url, currentCount);

    // Prevenir bucle infinito: si excedemos reintentos, cortamos la cadena
    if (currentCount >= MAX_RETRIES) {
      console.error(`Máximo de reintentos alcanzado para ${url}. Deteniendo bucle de peticiones.`);
      errorCountMap.delete(url);
      
      // No rechazar la promesa de forma que cause reintentos infinitos
      // Devolvemos un objeto con error para que el frontend lo maneje
      return Promise.resolve({
        error: true,
        maxRetriesReached: true,
        message: `No se pudo conectar con el servidor después de ${MAX_RETRIES} intentos`
      });
    }

    // Para otros errores, permitir que se manejen arriba pero con contador
    return Promise.reject(error);
  }
);
