export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IApiResponse<T = unknown> {
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
): IApiResponse<T> {
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
): IApiResponse {
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
): IApiResponse<T[]> {
  return {
    status: true,
    message,
    data,
    meta,
  };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Class-based API response for controllers that use static methods
export class ApiResponse {
  static success<T>(data?: T, message: string = 'Success'): IApiResponse<T> {
    return {
      status: true,
      message,
      ...(data !== undefined && { data }),
    };
  }

  static error(message: string, statusCode?: number, errorCode?: string, errors?: Record<string, string[]>): IApiResponse {
    return {
      status: false,
      message,
      ...(errorCode && { errorCode }),
      ...(errors && { errors }),
    };
  }

  static paginated<T>(data: T[], meta: PaginationMeta, message: string = 'Success'): IApiResponse<T[]> {
    return {
      status: true,
      message,
      data,
      meta,
    };
  }
}
