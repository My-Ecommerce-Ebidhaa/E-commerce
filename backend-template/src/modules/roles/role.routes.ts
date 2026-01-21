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
const controller = container.resolve(RoleController);

// All routes require tenant and authentication
router.use(tenantMiddleware);
router.use(authMiddleware());

// Get all available permissions (for role creation UI)
router.get('/permissions', controller.getAllPermissions);

// Get current user's permissions
router.get('/me/permissions', controller.getMyPermissions);

// Role CRUD - requires role management permission
router.get(
  '/',
  permissionMiddleware('roles:read'),
  validateMiddleware({ query: queryRoleSchema }),
  controller.findAll
);

router.get(
  '/:id',
  permissionMiddleware('roles:read'),
  controller.findById
);

router.get(
  '/:id/users',
  permissionMiddleware('roles:read'),
  controller.getRoleUsers
);

router.post(
  '/',
  permissionMiddleware('roles:create'),
  validateMiddleware({ body: createRoleSchema }),
  controller.create
);

router.patch(
  '/:id',
  permissionMiddleware('roles:update'),
  validateMiddleware({ body: updateRoleSchema }),
  controller.update
);

router.delete(
  '/:id',
  permissionMiddleware('roles:delete'),
  controller.delete
);

// User role management
router.get(
  '/users/:userId/roles',
  permissionMiddleware('staff:read'),
  controller.getUserRoles
);

router.get(
  '/users/:userId/permissions',
  permissionMiddleware('staff:read'),
  controller.getUserPermissions
);

router.post(
  '/assign',
  permissionMiddleware('roles:assign'),
  validateMiddleware({ body: assignRoleSchema }),
  controller.assignRole
);

router.post(
  '/remove',
  permissionMiddleware('roles:assign'),
  validateMiddleware({ body: removeRoleSchema }),
  controller.removeRole
);

export default router;
