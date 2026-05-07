// src/shared/types/post.types.ts

export interface PostUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface PostComment {
  id: string;
  userId: string;
  userFullName: string;
  userAvatarUrl: string | null;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string | null;
  userFullName: string | null;
  userAvatarUrl: string | null;
  isSpecialPost?: boolean;
  title?: string;
  matchId: string | null;
  homeTeamName: string | null;
  homeTeamFlagUrl: string | null;
  awayTeamName: string | null;
  awayTeamFlagUrl: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePrediction: number | null;
  awayPrediction: number | null;
  pointsEarned: number | null;
  matchDate: string | null;
  content: string;
  createdAt: string;
  comments: PostComment[];
}

export interface PostsResponse {
  posts: Post[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface PostsQueryParams {
  pageNumber: number;
  pageSize: number;
}

export interface PostError {
  message: string;
  statusCode: number;
  code?: string;
}