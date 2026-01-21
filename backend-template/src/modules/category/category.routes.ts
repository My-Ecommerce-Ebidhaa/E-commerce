import { Router } from 'express';
import { container } from 'tsyringe';
import { CategoryController } from './category.controller';
import { validate } from '@/shared/middlewares/validate.middleware';
import { authenticate } from '@/shared/middlewares/auth.middleware';
import { createCategorySchema, updateCategorySchema } from './dto/category.dto';
import { asyncHandler } from '@/shared/utils/async-handler';

const router = Router();
const controller = container.resolve(CategoryController);

// Public routes
router.get('/', asyncHandler(controller.findAll));
router.get('/tree', asyncHandler(controller.findTree));
router.get('/slug/:slug', asyncHandler(controller.findBySlug));
router.get('/:id', asyncHandler(controller.findById));

// Admin routes
router.post(
  '/',
  authenticate('admin'),
  validate(createCategorySchema),
  asyncHandler(controller.create)
);

router.patch(
  '/:id',
  authenticate('admin'),
  validate(updateCategorySchema),
  asyncHandler(controller.update)
);

router.delete(
  '/:id',
  authenticate('admin'),
  asyncHandler(controller.delete)
);

export default router;
