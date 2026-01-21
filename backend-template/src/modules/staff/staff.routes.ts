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
const controller = container.resolve(StaffController);

// Public route - Accept invitation (no auth required)
router.post(
  '/invitations/accept',
  tenantMiddleware,
  validateMiddleware({ body: acceptInvitationSchema }),
  controller.acceptInvitation
);

// Protected routes - require tenant and authentication
router.use(tenantMiddleware);
router.use(authMiddleware());

// Staff listing and details
router.get(
  '/',
  permissionMiddleware('staff:read'),
  validateMiddleware({ query: queryStaffSchema }),
  controller.findAll
);

router.get(
  '/:id',
  permissionMiddleware('staff:read'),
  controller.findById
);

// Staff management
router.patch(
  '/:id',
  permissionMiddleware('staff:update'),
  validateMiddleware({ body: updateStaffSchema }),
  controller.update
);

router.post(
  '/:id/deactivate',
  permissionMiddleware('staff:update'),
  controller.deactivate
);

router.post(
  '/:id/reactivate',
  permissionMiddleware('staff:update'),
  controller.reactivate
);

router.delete(
  '/:id',
  permissionMiddleware('staff:delete'),
  controller.remove
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
  controller.updateRoles
);

// Invitations
router.get(
  '/invitations/pending',
  permissionMiddleware('staff:read'),
  controller.getPendingInvitations
);

router.post(
  '/invitations',
  permissionMiddleware('staff:create'),
  validateMiddleware({ body: inviteStaffSchema }),
  controller.invite
);

router.post(
  '/invitations/:id/resend',
  permissionMiddleware('staff:create'),
  controller.resendInvitation
);

router.delete(
  '/invitations/:id',
  permissionMiddleware('staff:delete'),
  controller.cancelInvitation
);

export default router;
