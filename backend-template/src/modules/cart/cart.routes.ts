import { Router } from 'express';
import { container } from 'tsyringe';
import { CartController } from './cart.controller';
import { validate } from '@/shared/middlewares/validate.middleware';
import { authenticate, optionalAuth } from '@/shared/middlewares/auth.middleware';
import { addToCartSchema, updateCartItemSchema } from './dto/cart.dto';
import { asyncHandler } from '@/shared/utils/async-handler';

const router = Router();
const controller = container.resolve(CartController);

// Cart can be accessed with or without authentication
router.get('/', optionalAuth, asyncHandler(controller.getCart));
router.post('/', optionalAuth, validate(addToCartSchema), asyncHandler(controller.addToCart));
router.patch('/items/:itemId', optionalAuth, validate(updateCartItemSchema), asyncHandler(controller.updateCartItem));
router.delete('/items/:itemId', optionalAuth, asyncHandler(controller.removeFromCart));
router.delete('/', optionalAuth, asyncHandler(controller.clearCart));

// Merge guest cart - requires authentication
router.post('/merge', authenticate(), asyncHandler(controller.mergeCart));

export default router;
