import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IdempotencyService } from '@/shared/services/idempotency.service';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      idempotencyRecordId?: string;
      idempotencyKey?: string;
    }
  }
}

export interface IdempotencyConfig {
  requestType: string;
  expiryMinutes?: number;
  headerName?: string;
  required?: boolean;
}

export function idempotencyMiddleware(idempConfig: IdempotencyConfig) {
  const {
    requestType,
    expiryMinutes = 30,
    headerName = 'idempotency-key',
    required = false,
  } = idempConfig;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const idempotencyKey = req.headers[headerName.toLowerCase()] as string;

      if (!idempotencyKey) {
        if (required) {
          res.status(400).json({
            status: false,
            message: `${headerName} header is required`,
            errorCode: 'IDEMPOTENCY_KEY_REQUIRED',
          });
          return;
        }
        return next();
      }

      const idempotencyService = container.resolve(IdempotencyService);

      const result = await idempotencyService.check({
        tenantId: req.tenantId,
        idempotencyKey,
        requestType,
        requestPath: req.path,
        requestMethod: req.method,
        requestBody: req.body || {},
        expiryMinutes,
      });

      if (!result.isNew && result.cachedResponse) {
        res.status(result.cachedResponse.status).json(result.cachedResponse.data);
        return;
      }

      req.idempotencyRecordId = result.recordId;
      req.idempotencyKey = idempotencyKey;

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function completeIdempotency() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (data: unknown): Response {
      if (req.idempotencyRecordId && req.idempotencyKey && req.tenantId) {
        const idempotencyService = container.resolve(IdempotencyService);

        idempotencyService
          .complete(
            req.tenantId,
            req.idempotencyKey,
            req.idempotencyRecordId,
            data as Record<string, unknown>,
            res.statusCode
          )
          .catch((err) => {
            console.error('Failed to complete idempotency record:', err);
          });
      }

      return originalJson(data);
    };

    next();
  };
}
