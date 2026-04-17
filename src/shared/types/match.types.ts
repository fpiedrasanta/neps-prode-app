// src/shared/types/match.types.ts

export interface Team {
  id: string;
  name: string;
  flagUrl: string;
  country: {
    id: string;
    name: string;
    isoCode: string;
    isoCode2: string;
    flagUrl: string;
  };
}

export interface UserPrediction {
  Id?: string;  // El backend devuelve 'Id' con mayúscula
  id?: string;  // Por si acaso también aceptamos minúscula
  homeGoals: number;
  awayGoals: number;
  createdAt: string;
  updatedAt: string;
  points: number;
}

export interface PredictionStats {
  homeWinPercentage: number;
  drawPercentage: number;
  awayWinPercentage: number;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  matchDate: string;
  city: {
    id: string;
    name: string;
    country: {
      id: string;
      name: string;
      isoCode: string;
      isoCode2: string;
      flagUrl: string;
    };
  };
  country: {
    id: string;
    name: string;
    isoCode: string;
    isoCode2: string;
    flagUrl: string;
  };
  homeScore: number;
  awayScore: number;
  userPrediction: UserPrediction | null;
  points: number | null;
  predictionStats: PredictionStats;
  status: number | null;  // NULL, 1=Próximo, 2=En juego, 3=Finalizado
}

export interface MatchesResponse {
  items: Match[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type MatchStatus = 'upcoming' | 'live' | 'finished';

export interface MatchesQueryParams {
  status: number;
  teamNameSearch?: string;
  pageNumber: number;
  pageSize: number;
}