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

// Lazy resolve controller to ensure dependencies are registered first
const getController = () => container.resolve(AuthController);

// Public routes (require tenant context)
router.post(
  '/register',
  tenantMiddleware,
  validateMiddleware({ body: registerSchema }),
  (req, res, next) => getController().register(req, res, next)
);

router.post(
  '/login',
  tenantMiddleware,
  validateMiddleware({ body: loginSchema }),
  (req, res, next) => getController().login(req, res, next)
);

router.post(
  '/refresh',
  validateMiddleware({ body: refreshTokenSchema }),
  (req, res, next) => getController().refreshToken(req, res, next)
);

router.post(
  '/forgot-password',
  tenantMiddleware,
  validateMiddleware({ body: forgotPasswordSchema }),
  (req, res, next) => getController().forgotPassword(req, res, next)
);

router.post(
  '/reset-password',
  validateMiddleware({ body: resetPasswordSchema }),
  (req, res, next) => getController().resetPassword(req, res, next)
);

// Protected routes
router.get(
  '/me',
  tenantMiddleware,
  authMiddleware(),
  (req, res, next) => getController().getMe(req, res, next)
);

router.post(
  '/change-password',
  tenantMiddleware,
  authMiddleware(),
  validateMiddleware({ body: changePasswordSchema }),
  (req, res, next) => getController().changePassword(req, res, next)
);

router.post(
  '/logout',
  authMiddleware(),
  (req, res, next) => getController().logout(req, res, next)
);

export default router;
