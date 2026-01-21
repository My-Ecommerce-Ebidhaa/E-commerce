import { Router, raw } from 'express';
import { container } from 'tsyringe';
import { PaymentController } from './payment.controller';
import { StripeWebhookHandler } from './webhooks/stripe.webhook';
import { authenticate } from '@/shared/middlewares/auth.middleware';
import { asyncHandler } from '@/shared/utils/async-handler';
import { validate } from '@/shared/middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();
const controller = container.resolve(PaymentController);
const webhookHandler = container.resolve(StripeWebhookHandler);

// Stripe webhook - must use raw body
router.post(
  '/webhooks/stripe',
  raw({ type: 'application/json' }),
  asyncHandler(webhookHandler.handleWebhook)
);

// Payment status
router.get(
  '/status/:paymentIntentId',
  authenticate(),
  asyncHandler(controller.getPaymentStatus)
);

// Refund (admin only)
router.post(
  '/refund/:paymentIntentId',
  authenticate('admin'),
  validate(z.object({
    amount: z.number().positive().optional(),
    reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  })),
  asyncHandler(controller.createRefund)
);

// Stripe Connect - Admin endpoints
router.post(
  '/connect/setup',
  authenticate('admin'),
  validate(z.object({
    email: z.string().email(),
    businessName: z.string().min(1),
    country: z.string().length(2).optional(),
  })),
  asyncHandler(controller.setupPaymentAccount)
);

router.get(
  '/connect/status',
  authenticate('admin'),
  asyncHandler(controller.getAccountStatus)
);

router.get(
  '/connect/dashboard',
  authenticate('admin'),
  asyncHandler(controller.getDashboardLink)
);

export default router;
