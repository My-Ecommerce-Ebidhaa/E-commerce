import { Router } from 'express';
import { container } from 'tsyringe';
import { CartController } from './cart.controller';
import { validate } from '@/shared/middlewares/validate.middleware';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { addToCartSchema, updateCartItemSchema } from './dto/cart.dto';
import { asyncHandler } from '@/shared/utils/async-handler';

const router = Router();

// Lazy resolve controller
const getController = () => container.resolve(CartController);

// Optional auth middleware
const optionalAuth = authMiddleware({ optional: true });

// Cart can be accessed with or without authentication
router.get('/', optionalAuth, asyncHandler((req, res, next) => getController().getCart(req, res, next)));
router.post('/', optionalAuth, validate(addToCartSchema), asyncHandler((req, res, next) => getController().addToCart(req, res, next)));
router.patch('/items/:itemId', optionalAuth, validate(updateCartItemSchema), asyncHandler((req, res, next) => getController().updateCartItem(req, res, next)));
router.delete('/items/:itemId', optionalAuth, asyncHandler((req, res, next) => getController().removeFromCart(req, res, next)));
router.delete('/', optionalAuth, asyncHandler((req, res, next) => getController().clearCart(req, res, next)));

// Merge guest cart - requires authentication
router.post('/merge', authMiddleware(), asyncHandler((req, res, next) => getController().mergeCart(req, res, next)));

export default router;
