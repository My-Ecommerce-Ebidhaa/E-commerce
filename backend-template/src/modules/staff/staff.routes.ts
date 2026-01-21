import { Router } from 'express';
import { container } from 'tsyringe';
import { StaffController } from './staff.controller';
import { tenantMiddleware } from '@/shared/middlewares/tenant.middleware';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { permissionMiddleware } from '@/shared/middlewares/permission.middleware';
import { validateMiddleware } from '@/shared/middlewares/validate.middleware';
import {
  inviteStaffSchema,
  acceptInvitationSchema,
  updateStaffSchema,
  queryStaffSchema,
} from './dto/staff.dto';
import { z } from 'zod';

const router = Router();

// Lazy resolve controller
const getController = () => container.resolve(StaffController);

// Public route - Accept invitation (no auth required)
router.post(
  '/invitations/accept',
  tenantMiddleware,
  validateMiddleware({ body: acceptInvitationSchema }),
  (req, res, next) => getController().acceptInvitation(req, res, next)
);

// Protected routes - require tenant and authentication
router.use(tenantMiddleware);
router.use(authMiddleware());

// Staff listing and details
router.get(
  '/',
  permissionMiddleware('staff:read'),
  validateMiddleware({ query: queryStaffSchema }),
  (req, res, next) => getController().findAll(req, res, next)
);

router.get(
  '/:id',
  permissionMiddleware('staff:read'),
  (req, res, next) => getController().findById(req, res, next)
);

// Staff management
router.patch(
  '/:id',
  permissionMiddleware('staff:update'),
  validateMiddleware({ body: updateStaffSchema }),
  (req, res, next) => getController().update(req, res, next)
);

router.post(
  '/:id/deactivate',
  permissionMiddleware('staff:update'),
  (req, res, next) => getController().deactivate(req, res, next)
);

router.post(
  '/:id/reactivate',
  permissionMiddleware('staff:update'),
  (req, res, next) => getController().reactivate(req, res, next)
);

router.delete(
  '/:id',
  permissionMiddleware('staff:delete'),
  (req, res, next) => getController().remove(req, res, next)
);

// Role assignment
router.patch(
  '/:id/roles',
  permissionMiddleware('roles:assign'),
  validateMiddleware({
    body: z.object({
      roleIds: z.array(z.string().uuid()).min(1),
    }),
  }),
  (req, res, next) => getController().updateRoles(req, res, next)
);

// Invitations
router.get(
  '/invitations/pending',
  permissionMiddleware('staff:read'),
  (req, res, next) => getController().getPendingInvitations(req, res, next)
);

router.post(
  '/invitations',
  permissionMiddleware('staff:create'),
  validateMiddleware({ body: inviteStaffSchema }),
  (req, res, next) => getController().invite(req, res, next)
);

router.post(
  '/invitations/:id/resend',
  permissionMiddleware('staff:create'),
  (req, res, next) => getController().resendInvitation(req, res, next)
);

router.delete(
  '/invitations/:id',
  permissionMiddleware('staff:delete'),
  (req, res, next) => getController().cancelInvitation(req, res, next)
);

export default router;
