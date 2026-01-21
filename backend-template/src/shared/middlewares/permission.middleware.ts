import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { UserRoleRepository } from '@/repositories/role.repo';
import { ForbiddenError, UnauthorizedError } from '@/shared/errors/app.error';
import { UserRole as UserRoleEnum } from '@/shared/enums/generic.enum';

export interface PermissionMiddlewareOptions {
  requireAll?: boolean;
  bypassRoles?: UserRoleEnum[];
}

/**
 * Middleware to check if the authenticated user has the required permission(s)
 *
 * @param permissions - Single permission slug or array of permission slugs
 * @param options - Optional configuration
 *   - requireAll: If true, user must have ALL permissions. Default: false (any)
 *   - bypassRoles: Roles that bypass permission checks (e.g., SUPER_ADMIN)
 */
export function permissionMiddleware(
  permissions: string | string[],
  options: PermissionMiddlewareOptions = {}
) {
  const { requireAll = false, bypassRoles = [UserRoleEnum.SUPER_ADMIN] } = options;
  const permissionList = Array.isArray(permissions) ? permissions : [permissions];

  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.userId) {
        throw new UnauthorizedError(
          'Authentication required',
          'AUTHENTICATION_REQUIRED'
        );
      }

      // Check if user role bypasses permission checks
      if (bypassRoles.includes(req.user.role as UserRoleEnum)) {
        return next();
      }

      // Get user's permissions from their roles
      const userRoleRepo = container.resolve(UserRoleRepository);

      let hasPermission: boolean;

      if (requireAll) {
        hasPermission = await userRoleRepo.userHasAllPermissions(
          req.userId,
          permissionList
        );
      } else {
        hasPermission = await userRoleRepo.userHasAnyPermission(
          req.userId,
          permissionList
        );
      }

      if (!hasPermission) {
        throw new ForbiddenError(
          'Insufficient permissions',
          'INSUFFICIENT_PERMISSIONS',
          { required: permissionList, requireAll }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Convenience middleware that requires ALL listed permissions
 */
export function requireAllPermissions(permissions: string[]) {
  return permissionMiddleware(permissions, { requireAll: true });
}

/**
 * Convenience middleware that requires ANY of the listed permissions
 */
export function requireAnyPermission(permissions: string[]) {
  return permissionMiddleware(permissions, { requireAll: false });
}

/**
 * Module-based permission check - checks for the specified action on a module
 * Example: modulePermission('products', 'create') checks for 'products:create'
 */
export function modulePermission(module: string, action: string) {
  return permissionMiddleware(`${module}:${action}`);
}
