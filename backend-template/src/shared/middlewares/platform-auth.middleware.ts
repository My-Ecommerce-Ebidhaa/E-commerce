import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { UnauthorizedError, ForbiddenError } from '@/shared/errors/app.error';

// Extend Express Request type for platform admin
declare global {
  namespace Express {
    interface Request {
      platformAdminId?: string;
      platformAdmin?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface PlatformJwtPayload {
  adminId: string;
  email: string;
  role: string;
  type: 'platform';
}

/**
 * Middleware to authenticate platform admin requests
 * Platform admins use a separate JWT with type: 'platform'
 */
export function platformAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided', 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];

    let payload: PlatformJwtPayload;
    try {
      payload = jwt.verify(token, config.jwt.secret) as PlatformJwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }

    // Verify this is a platform admin token
    if (payload.type !== 'platform') {
      throw new ForbiddenError(
        'This endpoint requires platform admin access',
        'NOT_PLATFORM_ADMIN'
      );
    }

    req.platformAdminId = payload.adminId;
    req.platformAdmin = {
      id: payload.adminId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to require specific platform admin role
 */
export function platformRoleMiddleware(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.platformAdmin) {
        throw new UnauthorizedError('Not authenticated', 'NOT_AUTHENTICATED');
      }

      if (!allowedRoles.includes(req.platformAdmin.role)) {
        throw new ForbiddenError(
          `Requires one of these roles: ${allowedRoles.join(', ')}`,
          'INSUFFICIENT_ROLE'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
