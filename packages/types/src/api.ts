/** Bentuk response API yang konsisten (blueprint §26). */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { page?: number; perPage?: number; total?: number };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface Paginated<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
}
