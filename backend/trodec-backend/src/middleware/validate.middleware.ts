import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodTypeDef, ZodError, ZodIssue } from 'zod';
import { ApiError } from '@/utils/errors';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory to validate request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, or params)
 */
export function validate<TOutput, TInput = TOutput>(schema: ZodType<TOutput, ZodTypeDef, TInput>, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const result = schema.parse(data);

      // Only replace request data for body and params (query is read-only)
      if (target === 'body' || target === 'params') {
        req[target] = result;
      } else if (target === 'query') {
        // For query, store validated result in a different property
        (req as any).validatedQuery = result;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err: ZodIssue) => {
          const path = err.path.join('.');
          return path ? `${path}: ${err.message}` : err.message;
        });

        next(ApiError.badRequest(`Validation failed: ${messages.join(', ')}`));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request body
 */
export function validateBody<TOutput, TInput = TOutput>(schema: ZodType<TOutput, ZodTypeDef, TInput>) {
  return validate(schema, 'body');
}

/**
 * Validate query parameters
 */
export function validateQuery<TOutput, TInput = TOutput>(schema: ZodType<TOutput, ZodTypeDef, TInput>) {
  return validate(schema, 'query');
}

/**
 * Validate route parameters
 */
export function validateParams<TOutput, TInput = TOutput>(schema: ZodType<TOutput, ZodTypeDef, TInput>) {
  return validate(schema, 'params');
}
