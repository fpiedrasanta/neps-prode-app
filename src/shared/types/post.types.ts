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
  userId: string;
  userFullName: string;
  userAvatarUrl: string | null;
  matchId: string;
  homeTeamName: string;
  homeTeamFlagUrl: string;
  awayTeamName: string;
  awayTeamFlagUrl: string;
  homeScore: number;
  awayScore: number;
  homePrediction: number;
  awayPrediction: number;
  pointsEarned: number;
  matchDate: string;
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