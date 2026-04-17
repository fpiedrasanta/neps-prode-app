import { api } from "@/core/api/axios";

export interface RankingUser {
  position: number;
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  totalPoints: number;
  countryName: string;
}

export interface RankingResponse {
  users: RankingUser[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface RankingError {
  message: string;
  statusCode: number;
  code?: string;
}

const isAxiosError = (error: unknown): error is { response?: { status: number; data?: unknown } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

export const rankingService = {
  getRanking: async (page: number = 1, pageSize: number = 10, search: string = ''): Promise<RankingResponse> => {
    try {
      const response = await api.get<RankingResponse>('/Users/ranking', {
        params: {
          pageNumber: page,
          pageSize: pageSize,
          search: search
        }
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          throw { message: 'No autorizado. Por favor, inicie sesión.', statusCode: 401, code: 'UNAUTHORIZED' } as RankingError;
        }
        
        if (status === 403) {
          throw { message: 'Acceso denegado.', statusCode: 403, code: 'FORBIDDEN' } as RankingError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as RankingError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as RankingError;
    }
  }
};
