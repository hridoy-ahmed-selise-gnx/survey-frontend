export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly meta?: PagedMeta;
}

export interface PagedMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface PagedRequest {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly sortBy?: string;
  readonly sortDesc?: boolean;
}
