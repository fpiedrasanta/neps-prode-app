// src/shared/types/country.types.ts

export interface Country {
  id: string;
  name: string;
  isoCode: string;
  isoCode2: string | null;
  flagUrl: string;
}

export interface CountriesResponse {
  items: Country[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CountriesQueryParams {
  search?: string;
  orderBy?: string;
  orderDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}