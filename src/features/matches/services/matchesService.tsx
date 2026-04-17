// src/features/matches/services/matchesService.tsx

import { api } from "@/core/api/axios";
import type { MatchesResponse, MatchesQueryParams } from "@/shared/types";

const isAxiosError = (error: unknown): error is { response?: { status: number; data?: unknown } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

export interface MatchesError {
  message: string;
  statusCode: number;
  code?: string;
}

export const matchesService = {
  async getMatches(params: MatchesQueryParams): Promise<MatchesResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('status', params.status.toString());
      queryParams.append('pageNumber', params.pageNumber.toString());
      queryParams.append('pageSize', params.pageSize.toString());
      
      if (params.teamNameSearch) {
        queryParams.append('teamNameSearch', params.teamNameSearch);
      }

      const response = await api.get<MatchesResponse>(`/Matches?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          throw { message: 'No autorizado. Por favor, inicie sesión.', statusCode: 401, code: 'UNAUTHORIZED' } as MatchesError;
        }
        
        if (status === 403) {
          throw { message: 'Acceso denegado.', statusCode: 403, code: 'FORBIDDEN' } as MatchesError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as MatchesError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as MatchesError;
    }
  },
};