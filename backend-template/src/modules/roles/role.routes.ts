import { Router } from 'express';
import { container } from 'tsyringe';
import { RoleController } from './role.controller';
import { tenantMiddleware } from '@/shared/middlewares/tenant.middleware';
import { authMiddleware, adminMiddleware } from '@/shared/middlewares/auth.middleware';
import { permissionMiddleware } from '@/shared/middlewares/permission.middleware';
import { validateMiddleware } from '@/shared/middlewares/validate.middleware';
import {
  createRoleSchema,
  updateRoleSchema,
  queryRoleSchema,
  assignRoleSchema,
  removeRoleSchema,
} from './dto/role.dto';

const router = Router();

// Lazy resolve controller
const getController = () => container.resolve(RoleController);

// All routes require tenant and authentication
router.use(tenantMiddleware);
router.use(authMiddleware());

// Get all available permissions (for role creation UI)
router.get('/permissions', (req, res, next) => getController().getAllPermissions(req, res, next));

// Get current user's permissions
router.get('/me/permissions', (req, res, next) => getController().getMyPermissions(req, res, next));

// Role CRUD - requires role management permission
router.get(
  '/',
  permissionMiddleware('roles:read'),
  validateMiddleware({ query: queryRoleSchema }),
  (req, res, next) => getController().findAll(req, res, next)
);

router.get(
  '/:id',
  permissionMiddleware('roles:read'),
  (req, res, next) => getController().findById(req, res, next)
);

router.get(
  '/:id/users',
  permissionMiddleware('roles:read'),
  (req, res, next) => getController().getRoleUsers(req, res, next)
);

router.post(
  '/',
  permissionMiddleware('roles:create'),
  validateMiddleware({ body: createRoleSchema }),
  (req, res, next) => getController().create(req, res, next)
);

router.patch(
  '/:id',
  permissionMiddleware('roles:update'),
  validateMiddleware({ body: updateRoleSchema }),
  (req, res, next) => getController().update(req, res, next)
);

router.delete(
  '/:id',
  permissionMiddleware('roles:delete'),
  (req, res, next) => getController().delete(req, res, next)
);

// User role management
router.get(
  '/users/:userId/roles',
  permissionMiddleware('staff:read'),
  (req, res, next) => getController().getUserRoles(req, res, next)
);

router.get(
  '/users/:userId/permissions',
  permissionMiddleware('staff:read'),
  (req, res, next) => getController().getUserPermissions(req, res, next)
);

router.post(
  '/assign',
  permissionMiddleware('roles:assign'),
  validateMiddleware({ body: assignRoleSchema }),
  (req, res, next) => getController().assignRole(req, res, next)
);

router.post(
  '/remove',
  permissionMiddleware('roles:assign'),
  validateMiddleware({ body: removeRoleSchema }),
  (req, res, next) => getController().removeRole(req, res, next)
);

export default router;
