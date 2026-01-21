export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errorCode?: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    super(404, message, errorCode);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errorCode = 'BAD_REQUEST') {
    super(400, message, errorCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(401, message, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    super(403, message, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', errorCode = 'CONFLICT') {
    super(409, message, errorCode);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message = 'Validation failed',
    errors: Record<string, string[]> = {},
    errorCode = 'VALIDATION_ERROR'
  ) {
    super(422, message, errorCode);
    this.errors = errors;
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error', errorCode = 'INTERNAL_ERROR') {
    super(500, message, errorCode, false);
  }
}

export class PaymentError extends AppError {
  constructor(message = 'Payment failed', errorCode = 'PAYMENT_ERROR') {
    super(402, message, errorCode);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', errorCode = 'RATE_LIMIT_EXCEEDED') {
    super(429, message, errorCode);
  }
}
