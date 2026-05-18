import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    logger.error(`${err.statusCode}: ${err.message}`, {
      stack: err.stack,
      isOperational: err.isOperational,
    });
    sendError(res, err.message, err.statusCode);
    return;
  }

  logger.error(`500: ${err.message}`, { stack: err.stack });
  sendError(res, 'Internal Server Error', 500);
};
