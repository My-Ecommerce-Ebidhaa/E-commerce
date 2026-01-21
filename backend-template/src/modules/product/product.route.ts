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

// Lazy resolve controller
const getController = () => container.resolve(ProductController);

// Public routes
router.get(
  '/',
  tenantMiddleware,
  validateMiddleware({ query: queryProductSchema }),
  (req, res, next) => getController().findAll(req, res, next)
);

router.get(
  '/slug/:slug',
  tenantMiddleware,
  (req, res, next) => getController().findBySlug(req, res, next)
);

router.get(
  '/:id',
  tenantMiddleware,
  (req, res, next) => getController().findById(req, res, next)
);

// Admin routes
router.post(
  '/',
  tenantMiddleware,
  adminMiddleware(),
  validateMiddleware({ body: createProductSchema }),
  (req, res, next) => getController().create(req, res, next)
);

router.patch(
  '/:id',
  tenantMiddleware,
  adminMiddleware(),
  validateMiddleware({ body: updateProductSchema }),
  (req, res, next) => getController().update(req, res, next)
);

router.delete(
  '/:id',
  tenantMiddleware,
  adminMiddleware(),
  (req, res, next) => getController().delete(req, res, next)
);

router.patch(
  '/:id/inventory',
  tenantMiddleware,
  adminMiddleware(),
  validateMiddleware({
    body: z.object({ quantity: z.number().int().min(0) }),
  }),
  (req, res, next) => getController().updateInventory(req, res, next)
);

export default router;
