export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errorCode?: string;
  errors?: Record<string, string[]>;
}

export function SuccessResponse<T>(
  message: string,
  data?: T,
  meta?: PaginationMeta
): ApiResponse<T> {
  return {
    status: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };
}

export function ErrorResponse(
  message: string,
  errorCode?: string,
  errors?: Record<string, string[]>
): ApiResponse {
  return {
    status: false,
    message,
    ...(errorCode && { errorCode }),
    ...(errors && { errors }),
  };
}

export function PaginatedResponse<T>(
  message: string,
  data: T[],
  meta: PaginationMeta
): ApiResponse<T[]> {
  return {
    status: true,
    message,
    data,
    meta,
  };
}
