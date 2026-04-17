// src/shared/types/auth.types.ts

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  countryId: string | null;
  countryName: string | null;
  totalPoints: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}