export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request'): ApiError {
    return new ApiError(message, 400);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Not Found'): ApiError {
    return new ApiError(message, 404);
  }

  static internal(message = 'Internal Server Error'): ApiError {
    return new ApiError(message, 500);
  }
}
