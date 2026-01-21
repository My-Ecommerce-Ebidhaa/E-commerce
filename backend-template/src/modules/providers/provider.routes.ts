import { Router } from 'express';
import { container } from 'tsyringe';
import { ProviderController } from './provider.controller';
import { tenantMiddleware } from '@/shared/middlewares/tenant.middleware';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { permissionMiddleware } from '@/shared/middlewares/permission.middleware';
import { validateMiddleware } from '@/shared/middlewares/validate.middleware';
import {
  configurePaymentProviderSchema,
  updatePaymentProviderSchema,
  configureEmailProviderSchema,
  updateEmailProviderSchema,
  configureSmsProviderSchema,
  updateSmsProviderSchema,
} from './dto/provider.dto';

const router = Router();

// Lazy resolve controller
const getController = () => container.resolve(ProviderController);

// Get supported providers (public info)
router.get('/supported', (req, res, next) => getController().getSupportedProviders(req, res, next));

// All other routes require tenant and authentication
router.use(tenantMiddleware);
router.use(authMiddleware());

// ==================== PAYMENT PROVIDERS ====================

router.get(
  '/payment',
  permissionMiddleware('settings:read'),
  (req, res, next) => getController().getPaymentProviders(req, res, next)
);

router.get(
  '/payment/:id',
  permissionMiddleware('settings:read'),
  (req, res, next) => getController().getPaymentProvider(req, res, next)
);

router.post(
  '/payment',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: configurePaymentProviderSchema }),
  (req, res, next) => getController().configurePaymentProvider(req, res, next)
);

router.patch(
  '/payment/:id',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: updatePaymentProviderSchema }),
  (req, res, next) => getController().updatePaymentProvider(req, res, next)
);

router.delete(
  '/payment/:id',
  permissionMiddleware('settings:update'),
  (req, res, next) => getController().deletePaymentProvider(req, res, next)
);

// ==================== EMAIL PROVIDERS ====================

router.get(
  '/email',
  permissionMiddleware('settings:read'),
  (req, res, next) => getController().getEmailProviders(req, res, next)
);

router.get(
  '/email/:id',
  permissionMiddleware('settings:read'),
  (req, res, next) => getController().getEmailProvider(req, res, next)
);

router.post(
  '/email',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: configureEmailProviderSchema }),
  (req, res, next) => getController().configureEmailProvider(req, res, next)
);

router.patch(
  '/email/:id',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: updateEmailProviderSchema }),
  (req, res, next) => getController().updateEmailProvider(req, res, next)
);

router.delete(
  '/email/:id',
  permissionMiddleware('settings:update'),
  (req, res, next) => getController().deleteEmailProvider(req, res, next)
);

// ==================== SMS PROVIDERS ====================

router.get(
  '/sms',
  permissionMiddleware('settings:read'),
  (req, res, next) => getController().getSmsProviders(req, res, next)
);

router.get(
  '/sms/:id',
  permissionMiddleware('settings:read'),
  (req, res, next) => getController().getSmsProvider(req, res, next)
);

router.post(
  '/sms',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: configureSmsProviderSchema }),
  (req, res, next) => getController().configureSmsProvider(req, res, next)
);

router.patch(
  '/sms/:id',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: updateSmsProviderSchema }),
  (req, res, next) => getController().updateSmsProvider(req, res, next)
);

router.delete(
  '/sms/:id',
  permissionMiddleware('settings:update'),
  (req, res, next) => getController().deleteSmsProvider(req, res, next)
);

export default router;
