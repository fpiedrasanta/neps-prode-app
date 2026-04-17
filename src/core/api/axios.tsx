// src/core/api/axios.ts

import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.warn('VITE_API_URL no está configurada. Las peticiones API fallarán.');
}

export const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
  (error) => {
    const url = error.config?.url || 'unknown';
    
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

    if (error.response?.status === 401) {
      // Evitar bucle en la página de login
      if (!window.location.pathname.includes('/login')) {
        // Limpiar datos de sesión
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Redirigir al login
        window.location.href = "/login";
      }
      return Promise.resolve({ error: true, status: 401 });
    }

    // Para otros errores, permitir que se manejen arriba pero con contador
    return Promise.reject(error);
  }
);
