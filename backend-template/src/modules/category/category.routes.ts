import { Router } from 'express';
import { container } from 'tsyringe';
import { CategoryController } from './category.controller';
import { validateMiddleware } from '@/shared/middlewares/validate.middleware';
import { authenticate } from '@/shared/middlewares/auth.middleware';
import { tenantMiddleware } from '@/shared/middlewares/tenant.middleware';
import { createCategorySchema, updateCategorySchema } from './dto/category.dto';
import { asyncHandler } from '@/shared/utils/async-handler';

const router = Router();

// Lazy resolve controller
const getController = () => container.resolve(CategoryController);

// Public routes
router.get('/', tenantMiddleware, asyncHandler((req, res, next) => getController().findAll(req, res, next)));
router.get('/tree', tenantMiddleware, asyncHandler((req, res, next) => getController().findTree(req, res, next)));
router.get('/slug/:slug', tenantMiddleware, asyncHandler((req, res, next) => getController().findBySlug(req, res, next)));
router.get('/:id', tenantMiddleware, asyncHandler((req, res, next) => getController().findById(req, res, next)));

// Admin routes
router.post(
  '/',
  tenantMiddleware,
  authenticate('admin'),
  validateMiddleware(createCategorySchema),
  asyncHandler((req, res, next) => getController().create(req, res, next))
);

router.patch(
  '/:id',
  tenantMiddleware,
  authenticate('admin'),
  validateMiddleware(updateCategorySchema),
  asyncHandler((req, res, next) => getController().update(req, res, next))
);

router.delete(
  '/:id',
  tenantMiddleware,
  authenticate('admin'),
  asyncHandler((req, res, next) => getController().delete(req, res, next))
);

export default router;
