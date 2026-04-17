// src/features/social/services/postsService.ts

import { api } from "@/core/api/axios";
import type { PostsResponse, PostsQueryParams, PostError } from "@/shared/types";

const isAxiosError = (error: unknown): error is { response?: { status: number; data?: unknown } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

export const postsService = {
  getPosts: async (params: PostsQueryParams): Promise<PostsResponse> => {
    try {
      const response = await api.get<PostsResponse>('/Posts', {
        params: {
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
        }
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          throw { message: 'No autorizado. Por favor, inicie sesión.', statusCode: 401, code: 'UNAUTHORIZED' } as PostError;
        }
        
        if (status === 403) {
          throw { message: 'Acceso denegado.', statusCode: 403, code: 'FORBIDDEN' } as PostError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as PostError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as PostError;
    }
  },

  createComment: async (postId: string, content: string) => {
    try {
      const response = await api.post(`/Posts/${postId}/comments`, {
        content
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          throw { message: 'No autorizado. Por favor, inicie sesión.', statusCode: 401, code: 'UNAUTHORIZED' } as PostError;
        }
        
        if (status === 403) {
          throw { message: 'Acceso denegado.', statusCode: 403, code: 'FORBIDDEN' } as PostError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as PostError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as PostError;
    }
  }
};
