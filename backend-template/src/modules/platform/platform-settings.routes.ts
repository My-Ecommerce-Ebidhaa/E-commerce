import { Router } from 'express';
import { container } from 'tsyringe';
import { PlatformSettingsController } from './platform-settings.controller';
import { platformAuthMiddleware } from '@/shared/middlewares/platform-auth.middleware';
import { validateMiddleware } from '@/shared/middlewares/validate.middleware';
import {
  configureDefaultProviderSchema,
  updatePlatformSettingsSchema,
} from './dto/platform-settings.dto';

const router = Router();

// Lazy resolve controller
const getController = () => container.resolve(PlatformSettingsController);

// All routes require platform admin authentication
router.use(platformAuthMiddleware);

// Get supported providers (for reference)
router.get('/providers/supported', (req, res, next) =>
  getController().getSupportedProviders(req, res, next)
);

// Get platform settings
router.get('/', (req, res, next) => getController().getSettings(req, res, next));

// Update platform settings
router.patch(
  '/',
  validateMiddleware({ body: updatePlatformSettingsSchema }),
  (req, res, next) => getController().updateSettings(req, res, next)
);

// Configure default payment provider
router.post(
  '/providers/payment',
  validateMiddleware({ body: configureDefaultProviderSchema }),
  (req, res, next) => getController().configureDefaultPaymentProvider(req, res, next)
);

// Configure default email provider
router.post(
  '/providers/email',
  validateMiddleware({ body: configureDefaultProviderSchema }),
  (req, res, next) => getController().configureDefaultEmailProvider(req, res, next)
);

// Configure default SMS provider
router.post(
  '/providers/sms',
  validateMiddleware({ body: configureDefaultProviderSchema }),
  (req, res, next) => getController().configureDefaultSmsProvider(req, res, next)
);

// Remove default provider
router.delete('/providers/:type', (req, res, next) =>
  getController().removeDefaultProvider(req, res, next)
);

// Check provider status
router.get('/providers/:type/status', (req, res, next) =>
  getController().getProviderStatus(req, res, next)
);

export default router;
