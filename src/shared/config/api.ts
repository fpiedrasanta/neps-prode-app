// src/shared/config/api.ts
export const API_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://localhost:7163/api',
  baseUrl: import.meta.env.VITE_BASE_URL || 'https://localhost:7163',
  timeout: 30000,
};

/**
 * Construye URL completa para recursos estáticos del backend (imágenes, avatares, banderas)
 * @param relativePath Ruta relativa que devuelve el backend (ej: "/uploads/flags/...")
 * @returns URL completa con la base correcta para archivos estáticos
 */
export function getResourceUrl(relativePath: string | null | undefined): string | undefined {
  if (!relativePath) return undefined;
  
  // Si ya es una URL completa, devolverla como está
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Construir URL completa con la base SIN /api para archivos estáticos
  return `${API_CONFIG.baseUrl}${relativePath}`;
}
