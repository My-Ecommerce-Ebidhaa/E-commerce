import express, { Express } from 'express';
import { config } from '@/config';
import {
  initializeMiddlewares,
  initializeErrorHandlers,
} from '@/shared/middlewares';

// Routes
import healthRoutes from '@/modules/health/health.route';
import authRoutes from '@/modules/auth/auth.route';
import productRoutes from '@/modules/product/product.route';
import cartRoutes from '@/modules/cart/cart.routes';
import checkoutRoutes from '@/modules/checkout/checkout.routes';
import paymentRoutes from '@/modules/payment/payment.routes';
import categoryRoutes from '@/modules/category/category.routes';
import roleRoutes from '@/modules/roles/role.routes';
import staffRoutes from '@/modules/staff/staff.routes';
import providerRoutes from '@/modules/providers/provider.routes';
import platformSettingsRoutes from '@/modules/platform/platform-settings.routes';

export function createApp(): Express {
  const app = express();

  // Initialize middlewares
  initializeMiddlewares(app);

  // API version prefix
  const apiPrefix = `/api/${config.app.apiVersion}`;

  // Health check (no prefix)
  app.use('/health', healthRoutes);

  // API routes
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/products`, productRoutes);
  app.use(`${apiPrefix}/cart`, cartRoutes);
  app.use(`${apiPrefix}/checkout`, checkoutRoutes);
  app.use(`${apiPrefix}/payments`, paymentRoutes);
  app.use(`${apiPrefix}/categories`, categoryRoutes);
  app.use(`${apiPrefix}/roles`, roleRoutes);
  app.use(`${apiPrefix}/staff`, staffRoutes);
  app.use(`${apiPrefix}/providers`, providerRoutes);
  app.use(`${apiPrefix}/platform/settings`, platformSettingsRoutes);

  // Error handlers (must be last)
  initializeErrorHandlers(app);

  return app;
}
