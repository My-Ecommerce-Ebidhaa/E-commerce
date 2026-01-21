import { Router } from 'express';
import { container } from 'tsyringe';
import { ProductController } from './product.controller';
import { tenantMiddleware } from '@/shared/middlewares/tenant.middleware';
import { authMiddleware, adminMiddleware } from '@/shared/middlewares/auth.middleware';
import { validateMiddleware } from '@/shared/middlewares/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
} from './dto/product.dto';
import { z } from 'zod';

const router = Router();
const controller = container.resolve(ProductController);

// Public routes
router.get(
  '/',
  tenantMiddleware,
  validateMiddleware({ query: queryProductSchema }),
  controller.findAll
);

router.get(
  '/slug/:slug',
  tenantMiddleware,
  controller.findBySlug
);

router.get(
  '/:id',
  tenantMiddleware,
  controller.findById
);

// Admin routes
router.post(
  '/',
  tenantMiddleware,
  adminMiddleware(),
  validateMiddleware({ body: createProductSchema }),
  controller.create
);

router.patch(
  '/:id',
  tenantMiddleware,
  adminMiddleware(),
  validateMiddleware({ body: updateProductSchema }),
  controller.update
);

router.delete(
  '/:id',
  tenantMiddleware,
  adminMiddleware(),
  controller.delete
);

router.patch(
  '/:id/inventory',
  tenantMiddleware,
  adminMiddleware(),
  validateMiddleware({
    body: z.object({ quantity: z.number().int().min(0) }),
  }),
  controller.updateInventory
);

export default router;
