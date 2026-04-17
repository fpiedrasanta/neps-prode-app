// src/features/matches/services/predictionsService.tsx

import { api } from "@/core/api/axios";
import type { ApiResponse } from "@/shared/types";

const isAxiosError = (error: unknown): error is { response?: { status: number; data?: unknown } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

export interface PredictionError {
  message: string;
  statusCode: number;
  code?: string;
}

export interface CreatePredictionRequest {
  matchId: string;
  homeGoals: number;
  awayGoals: number;
}

export const predictionsService = {
  async createPrediction(data: CreatePredictionRequest): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<ApiResponse<void>>("/Predictions", data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
        
        if (status === 401) {
          throw { message: 'No autorizado. Por favor, inicie sesión.', statusCode: 401, code: 'UNAUTHORIZED' } as PredictionError;
        }
        
        if (status === 400 && data?.errors) {
          const errors = Object.entries(data.errors).map(([field, messages]) => `${field}: ${messages.join(', ')}`);
          throw { message: errors.join('; '), statusCode: 400, code: 'VALIDATION_ERROR' } as PredictionError;
        }
        
        if (status === 409) {
          throw { message: 'Ya realizaste un pronóstico para este partido.', statusCode: 409, code: 'CONFLICT' } as PredictionError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as PredictionError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as PredictionError;
    }
  },

  async updatePrediction(predictionId: string, homeGoals: number, awayGoals: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.put<ApiResponse<void>>(`/Predictions/${predictionId}`, { homeGoals, awayGoals });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
        
        if (status === 401) {
          throw { message: 'No autorizado. Por favor, inicie sesión.', statusCode: 401, code: 'UNAUTHORIZED' } as PredictionError;
        }
        
        if (status === 400 && data?.errors) {
          const errors = Object.entries(data.errors).map(([field, messages]) => `${field}: ${messages.join(', ')}`);
          throw { message: errors.join('; '), statusCode: 400, code: 'VALIDATION_ERROR' } as PredictionError;
        }
        
        if (status === 404) {
          throw { message: 'Pronóstico no encontrado.', statusCode: 404, code: 'NOT_FOUND' } as PredictionError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as PredictionError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as PredictionError;
    }
  },
};
