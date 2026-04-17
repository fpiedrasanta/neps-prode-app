// src/features/auth/services/authService.ts

import { api } from "@/core/api/axios";
import type { LoginCredentials, AuthResponse } from "@/shared/types";

export interface LoginError {
  message: string;
  statusCode: number;
  code?: string;
}

const isAxiosError = (error: unknown): error is { response?: { status: number; data?: unknown } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

export const authService = {
  async login(data: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
        
        if (status === 401) {
          throw { message: 'Credenciales inválidas', statusCode: 401, code: 'INVALID_CREDENTIALS' } as LoginError;
        }
        
        if (status === 400 && data?.errors) {
          const errors = Object.entries(data.errors).map(([field, messages]) => `${field}: ${messages.join(', ')}`);
          throw { message: errors.join('; '), statusCode: 400, code: 'VALIDATION_ERROR' } as LoginError;
        }
        
        if (status === 429) {
          throw { message: 'Demasiados intentos. Intente más tarde.', statusCode: 429, code: 'RATE_LIMIT' } as LoginError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as LoginError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as LoginError;
    }
  },
};
