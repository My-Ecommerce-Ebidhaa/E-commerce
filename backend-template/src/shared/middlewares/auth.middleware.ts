import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { container } from 'tsyringe';
import { UserRepository } from '@/repositories/user.repo';
import { UnauthorizedError, ForbiddenError } from '@/shared/errors/app.error';
import { config } from '@/config';
import { User } from '@/models/User.model';
import { UserRole } from '@/shared/enums/generic.enum';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

export interface JwtPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
}

export interface AuthMiddlewareOptions {
  optional?: boolean;
  roles?: UserRole[];
}

export function authMiddleware(options: AuthMiddlewareOptions = {}) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (options.optional) {
          return next();
        }
        throw new UnauthorizedError('No token provided', 'NO_TOKEN');
      }

      const token = authHeader.split(' ')[1];

      let payload: JwtPayload;
      try {
        payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
      } catch (error) {
        if (options.optional) {
          return next();
        }
        throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
      }

      // Verify tenant matches
      if (req.tenantId && payload.tenantId !== req.tenantId) {
        throw new ForbiddenError(
          'Token does not belong to this tenant',
          'TENANT_MISMATCH'
        );
      }

      // Get user from database
      const userRepo = container.resolve(UserRepository);
      const user = await userRepo.findById(payload.userId);

      if (!user) {
        throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
      }

      // Check role if specified
      if (options.roles && options.roles.length > 0) {
        if (!options.roles.includes(user.role)) {
          throw new ForbiddenError(
            'Insufficient permissions',
            'INSUFFICIENT_PERMISSIONS'
          );
        }
      }

      req.user = user;
      req.userId = user.id;

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Convenience middleware for admin-only routes
export function adminMiddleware() {
  return authMiddleware({
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  });
}

// Convenience middleware for super admin-only routes
export function superAdminMiddleware() {
  return authMiddleware({
    roles: [UserRole.SUPER_ADMIN],
  });
}
