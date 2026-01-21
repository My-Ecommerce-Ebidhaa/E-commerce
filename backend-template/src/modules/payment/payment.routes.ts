import { Router, raw } from 'express';
import { container } from 'tsyringe';
import { PaymentController } from './payment.controller';
import { StripeWebhookHandler } from './webhooks/stripe.webhook';
import { authenticate } from '@/shared/middlewares/auth.middleware';
import { asyncHandler } from '@/shared/utils/async-handler';
import { validateMiddleware } from '@/shared/middlewares/validate.middleware';
import { tenantMiddleware } from '@/shared/middlewares/tenant.middleware';
import { z } from 'zod';

const router = Router();

// Lazy resolve controllers
const getController = () => container.resolve(PaymentController);
const getWebhookHandler = () => container.resolve(StripeWebhookHandler);

// Stripe webhook - must use raw body
router.post(
  '/webhooks/stripe',
  raw({ type: 'application/json' }),
  asyncHandler((req, res, next) => getWebhookHandler().handleWebhook(req, res, next))
);

// Payment status
router.get(
  '/status/:paymentIntentId',
  tenantMiddleware,
  authenticate(),
  asyncHandler((req, res, next) => getController().getPaymentStatus(req, res, next))
);

// Refund (admin only)
router.post(
  '/refund/:paymentIntentId',
  tenantMiddleware,
  authenticate('admin'),
  validateMiddleware(z.object({
    amount: z.number().positive().optional(),
    reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  })),
  asyncHandler((req, res, next) => getController().createRefund(req, res, next))
);

// Stripe Connect - Admin endpoints
router.post(
  '/connect/setup',
  tenantMiddleware,
  authenticate('admin'),
  validateMiddleware(z.object({
    email: z.string().email(),
    businessName: z.string().min(1),
    country: z.string().length(2).optional(),
  })),
  asyncHandler((req, res, next) => getController().setupPaymentAccount(req, res, next))
);

router.get(
  '/connect/status',
  tenantMiddleware,
  authenticate('admin'),
  asyncHandler((req, res, next) => getController().getAccountStatus(req, res, next))
);

router.get(
  '/connect/dashboard',
  tenantMiddleware,
  authenticate('admin'),
  asyncHandler((req, res, next) => getController().getDashboardLink(req, res, next))
);

export default router;
