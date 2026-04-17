// src/features/auth/services/userService.ts

import { api } from "@/core/api/axios";
import type { User } from "@/shared/types/auth.types";
import type { CountriesResponse, CountriesQueryParams } from "@/shared/types/country.types";

const isAxiosError = (error: unknown): error is { response?: { status: number; data?: unknown } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

export interface UserError {
  message: string;
  statusCode: number;
  code?: string;
}

export const userService = {
  getProfile: async (userId: string): Promise<User> => {
    try {
      const response = await api.get<User>(`/Users/${userId}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          throw { message: 'No autorizado. Por favor, inicie sesión.', statusCode: 401, code: 'UNAUTHORIZED' } as UserError;
        }
        
        if (status === 403) {
          throw { message: 'Acceso denegado.', statusCode: 403, code: 'FORBIDDEN' } as UserError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as UserError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as UserError;
    }
  },

  updateProfile: async (userId: string, data: FormData): Promise<User> => {
    try {
      const response = await api.put<User>(`/Users/${userId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          throw { message: 'No autorizado. Por favor, inicie sesión.', statusCode: 401, code: 'UNAUTHORIZED' } as UserError;
        }
        
        if (status === 403) {
          throw { message: 'Acceso denegado.', statusCode: 403, code: 'FORBIDDEN' } as UserError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as UserError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as UserError;
    }
  },

  getCountries: async (params: CountriesQueryParams = {}): Promise<CountriesResponse> => {
    try {
      const response = await api.get<CountriesResponse>('/Countries', {
        params: {
          search: params.search || '',
          orderBy: params.orderBy || 'Name',
          orderDescending: params.orderDescending || false,
          pageNumber: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
        }
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          throw { message: 'No autorizado. Por favor, inicie sesión.', statusCode: 401, code: 'UNAUTHORIZED' } as UserError;
        }
        
        if (status === 403) {
          throw { message: 'Acceso denegado.', statusCode: 403, code: 'FORBIDDEN' } as UserError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as UserError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as UserError;
    }
  }
};