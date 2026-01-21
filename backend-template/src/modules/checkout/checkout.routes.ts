import { Router } from 'express';
import { container } from 'tsyringe';
import { CheckoutController } from './checkout.controller';
import { validateMiddleware } from '@/shared/middlewares/validate.middleware';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { idempotencyMiddleware } from '@/shared/middlewares/idempotency.middleware';
import {
  initiateCheckoutSchema,
  confirmCheckoutSchema,
  calculateShippingSchema,
} from './dto/checkout.dto';
import { asyncHandler } from '@/shared/utils/async-handler';
import { z } from 'zod';

const router = Router();

// Lazy resolve controller
const getController = () => container.resolve(CheckoutController);

// Optional auth middleware
const optionalAuth = authMiddleware({ optional: true });

// Idempotency middleware for checkout
const checkoutIdempotency = idempotencyMiddleware({
  requestType: 'checkout',
  required: false,
});

// Calculate shipping rates
router.post(
  '/shipping',
  optionalAuth,
  validateMiddleware(calculateShippingSchema),
  asyncHandler((req, res, next) => getController().calculateShipping(req, res, next))
);

// Validate discount code
router.post(
  '/discount/validate',
  optionalAuth,
  validateMiddleware(z.object({ code: z.string(), subtotal: z.number() })),
  asyncHandler((req, res, next) => getController().validateDiscount(req, res, next))
);

// Initiate checkout (creates order with pending_payment status)
router.post(
  '/',
  optionalAuth,
  checkoutIdempotency,
  validateMiddleware(initiateCheckoutSchema),
  asyncHandler((req, res, next) => getController().initiateCheckout(req, res, next))
);

// Confirm checkout (after payment success)
router.post(
  '/:orderId/confirm',
  optionalAuth,
  validateMiddleware(confirmCheckoutSchema),
  asyncHandler((req, res, next) => getController().confirmCheckout(req, res, next))
);

// Cancel checkout (releases inventory)
router.post(
  '/:orderId/cancel',
  optionalAuth,
  asyncHandler((req, res, next) => getController().cancelCheckout(req, res, next))
);

// Get order details
router.get(
  '/orders/:orderId',
  optionalAuth,
  asyncHandler((req, res, next) => getController().getOrder(req, res, next))
);

export default router;
