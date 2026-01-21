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
const controller = container.resolve(ProviderController);

// Get supported providers (public info)
router.get('/supported', controller.getSupportedProviders);

// All other routes require tenant and authentication
router.use(tenantMiddleware);
router.use(authMiddleware());

// ==================== PAYMENT PROVIDERS ====================

router.get(
  '/payment',
  permissionMiddleware('settings:read'),
  controller.getPaymentProviders
);

router.get(
  '/payment/:id',
  permissionMiddleware('settings:read'),
  controller.getPaymentProvider
);

router.post(
  '/payment',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: configurePaymentProviderSchema }),
  controller.configurePaymentProvider
);

router.patch(
  '/payment/:id',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: updatePaymentProviderSchema }),
  controller.updatePaymentProvider
);

router.delete(
  '/payment/:id',
  permissionMiddleware('settings:update'),
  controller.deletePaymentProvider
);

// ==================== EMAIL PROVIDERS ====================

router.get(
  '/email',
  permissionMiddleware('settings:read'),
  controller.getEmailProviders
);

router.get(
  '/email/:id',
  permissionMiddleware('settings:read'),
  controller.getEmailProvider
);

router.post(
  '/email',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: configureEmailProviderSchema }),
  controller.configureEmailProvider
);

router.patch(
  '/email/:id',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: updateEmailProviderSchema }),
  controller.updateEmailProvider
);

router.delete(
  '/email/:id',
  permissionMiddleware('settings:update'),
  controller.deleteEmailProvider
);

// ==================== SMS PROVIDERS ====================

router.get(
  '/sms',
  permissionMiddleware('settings:read'),
  controller.getSmsProviders
);

router.get(
  '/sms/:id',
  permissionMiddleware('settings:read'),
  controller.getSmsProvider
);

router.post(
  '/sms',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: configureSmsProviderSchema }),
  controller.configureSmsProvider
);

router.patch(
  '/sms/:id',
  permissionMiddleware('settings:update'),
  validateMiddleware({ body: updateSmsProviderSchema }),
  controller.updateSmsProvider
);

router.delete(
  '/sms/:id',
  permissionMiddleware('settings:update'),
  controller.deleteSmsProvider
);

export default router;
