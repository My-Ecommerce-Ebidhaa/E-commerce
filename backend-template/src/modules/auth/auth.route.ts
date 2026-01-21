import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from './auth.controller';
import { tenantMiddleware } from '@/shared/middlewares/tenant.middleware';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { validateMiddleware } from '@/shared/middlewares/validate.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from './dto/auth.dto';

const router = Router();
const controller = container.resolve(AuthController);

// Public routes (require tenant context)
router.post(
  '/register',
  tenantMiddleware,
  validateMiddleware({ body: registerSchema }),
  controller.register
);

router.post(
  '/login',
  tenantMiddleware,
  validateMiddleware({ body: loginSchema }),
  controller.login
);

router.post(
  '/refresh',
  validateMiddleware({ body: refreshTokenSchema }),
  controller.refreshToken
);

router.post(
  '/forgot-password',
  tenantMiddleware,
  validateMiddleware({ body: forgotPasswordSchema }),
  controller.forgotPassword
);

router.post(
  '/reset-password',
  validateMiddleware({ body: resetPasswordSchema }),
  controller.resetPassword
);

// Protected routes
router.get(
  '/me',
  tenantMiddleware,
  authMiddleware(),
  controller.getMe
);

router.post(
  '/change-password',
  tenantMiddleware,
  authMiddleware(),
  validateMiddleware({ body: changePasswordSchema }),
  controller.changePassword
);

router.post(
  '/logout',
  authMiddleware(),
  controller.logout
);

export default router;
