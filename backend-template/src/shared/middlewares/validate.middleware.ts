import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/shared/errors/app.error';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validateMiddleware(schemas: ValidationSchemas | ZodSchema) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // If a single schema is passed, assume it's for body
      if ('parse' in schemas) {
        req.body = schemas.parse(req.body);
        return next();
      }

      const { body, query, params } = schemas;

      if (body) {
        req.body = body.parse(req.body);
      }

      if (query) {
        req.query = query.parse(req.query);
      }

      if (params) {
        req.params = params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error);
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return errors;
}
