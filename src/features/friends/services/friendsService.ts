import { api } from "@/core/api/axios";

export interface Friend {
  id: string;
  friendId: string;
  friendEmail: string;
  friendFullName: string;
  friendAvatarUrl: string;
  friendTotalPoints: number | null;
  friendCountryName: string;
  status: number;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  friendId: string;
  friendFullName: string;
  friendAvatarUrl: string;
  friendTotalPoints: number | null;
  friendCountryName: string;
  status: number;
  createdAt: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  totalPoints: number;
  countryName: string;
}

export interface FriendsSummary {
  friends: Friend[];
  sentRequests: FriendRequest[];
  receivedRequests: FriendRequest[];
  currentUser: CurrentUser;
  maxFriends: number;
  friendsCount: number;
  sentRequestsCount: number;
  availableSlots: number;
}

export interface FriendsError {
  message: string;
  statusCode: number;
  code?: string;
}

export interface SearchUser {
  id: string;
  fullName: string;
  avatarUrl: string;
}

const isAxiosError = (error: unknown): error is { response?: { status: number; data?: unknown } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

export const friendsService = {
  getSummary: async (): Promise<FriendsSummary> => {
    try {
      const response = await api.get<FriendsSummary>('/Friendships/summary');
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          throw { message: 'No autorizado. Por favor, inicie sesión.', statusCode: 401, code: 'UNAUTHORIZED' } as FriendsError;
        }
        
        if (status === 403) {
          throw { message: 'Acceso denegado.', statusCode: 403, code: 'FORBIDDEN' } as FriendsError;
        }
        
        if (status && status >= 500) {
          throw { message: 'Error del servidor. Intente más tarde.', statusCode: status, code: 'SERVER_ERROR' } as FriendsError;
        }
      }
      
      throw { message: 'Error de conexión. Verifique su internet.', statusCode: 0, code: 'NETWORK_ERROR' } as FriendsError;
    }
  },

  removeFriend: async (friendId: string): Promise<void> => {
    await api.delete(`/Friendships/${friendId}`);
  },

  acceptFriendship: async (friendshipId: string): Promise<void> => {
    await api.post(`/Friendships/${friendshipId}/accept`);
  },

  declineFriendship: async (friendshipId: string): Promise<void> => {
    await api.post(`/Friendships/${friendshipId}/decline`);
  },

  sendFriendRequest: async (targetUserId: string): Promise<void> => {
    await api.post(`/Friendships/request?targetUserId=${targetUserId}`);
  },

  searchUsers: async (search: string): Promise<SearchUser[]> => {
    const response = await api.get<{ users: SearchUser[] }>('/Users/ranking', {
      params: {
        pageNumber: 1,
        pageSize: 10,
        search: search
      }
    });
    return response.data.users;
  }
};