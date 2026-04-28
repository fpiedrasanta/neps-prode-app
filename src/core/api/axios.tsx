// src/core/api/axios.ts
// ✅ 🔒 IMPLEMENTACION SEGURA CON COOKIES HTTPONLY
//
// ✅ VENTAJAS DE SEGURIDAD:
//  1. Refresh token NUNCA es accesible desde Javascript
//  2. No puede ser robado por ataques XSS
//  3. El navegador se encarga automaticamente de enviarlo
//  4. Solo se envía al mismo dominio (SameSite)
//  5. Solo se envía por HTTPS
//
// ❌ ATAQUES QUE SE EVITAN:
//  - Robo de refresh token via XSS
//  - Robo de tokens desde localStorage
//  - Acceso de scripts de terceros a credenciales

import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { broadcastLogout } from "../auth/sessionChannel";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.warn('VITE_API_URL no está configurada. Las peticiones API fallarán.');
}

export const api = axios.create({
  baseURL: baseURL,
  // ✅ OBLIGATORIO: Enviar automaticamente cookies en TODAS las peticiones
  withCredentials: true,
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
  // ✅ Tomar accessToken DIRECTAMENTE DEL STORE (MEMORIA)
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

    // Si es error 401 y no es la petición de refresh ni logout
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('auth/refresh-token') &&
      !originalRequest.url?.includes('auth/logout')
    ) {
      
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

      (originalRequest as { _retry?: boolean } & typeof originalRequest)._retry = true;
      isRefreshing = true;

      try {
        // ✅ INTENTAR REFRESCAR EL TOKEN
        // SIN BODY, SIN NADA. LA COOKIE SE ENVIA SOLA.
        const response = await api.post('auth/refresh-token');
        
        const { token, user } = response.data;
        
        // ✅ Guardamos SOLO EN MEMORIA
        const setAccessToken = useAuthStore.getState().setAccessToken;
        setAccessToken(token, user);
        
        // Actualizar header con el nuevo token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Procesar la cola de peticiones pendientes
        processQueue(null, token);
        
        // Reintentar la petición original
        return api(originalRequest);
        
      } catch (refreshError) {
        // Falló el refresh token, desloguear usuario COMPLETAMENTE
        processQueue(refreshError, null);
        
        // ✅ Limpiamos estado de autenticación
        useAuthStore.getState().logout();
        
        // ✅ Notificamos a todas las pestañas abiertas
        broadcastLogout();
        
        // ✅ La redirección se maneja automaticamente en AppRouter
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