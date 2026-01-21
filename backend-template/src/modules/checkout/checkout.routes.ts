import { Router } from 'express';
import { container } from 'tsyringe';
import { CheckoutController } from './checkout.controller';
import { validate } from '@/shared/middlewares/validate.middleware';
import { authenticate, optionalAuth } from '@/shared/middlewares/auth.middleware';
import { idempotency } from '@/shared/middlewares/idempotency.middleware';
import {
  initiateCheckoutSchema,
  confirmCheckoutSchema,
  calculateShippingSchema,
} from './dto/checkout.dto';
import { asyncHandler } from '@/shared/utils/async-handler';
import { z } from 'zod';

const router = Router();
const controller = container.resolve(CheckoutController);

// Calculate shipping rates
router.post(
  '/shipping',
  optionalAuth,
  validate(calculateShippingSchema),
  asyncHandler(controller.calculateShipping)
);

// Validate discount code
router.post(
  '/discount/validate',
  optionalAuth,
  validate(z.object({ code: z.string(), subtotal: z.number() })),
  asyncHandler(controller.validateDiscount)
);

// Initiate checkout (creates order with pending_payment status)
router.post(
  '/',
  optionalAuth,
  idempotency,
  validate(initiateCheckoutSchema),
  asyncHandler(controller.initiateCheckout)
);

// Confirm checkout (after payment success)
router.post(
  '/:orderId/confirm',
  optionalAuth,
  validate(confirmCheckoutSchema),
  asyncHandler(controller.confirmCheckout)
);

// Cancel checkout (releases inventory)
router.post(
  '/:orderId/cancel',
  optionalAuth,
  asyncHandler(controller.cancelCheckout)
);

// Get order details
router.get(
  '/orders/:orderId',
  optionalAuth,
  asyncHandler(controller.getOrder)
);

export default router;
