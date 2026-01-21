import 'reflect-metadata';
import { container } from 'tsyringe';

// Repositories
import { TenantRepository } from '@/repositories/tenant.repo';
import { UserRepository } from '@/repositories/user.repo';
import { ProductRepository } from '@/repositories/product.repo';
import { CategoryRepository } from '@/repositories/category.repo';
import { CartRepository, CartItemRepository } from '@/repositories/cart.repo';
import { OrderRepository, OrderItemRepository } from '@/repositories/order.repo';
import { DiscountRepository } from '@/repositories/discount.repo';
import { IdempotencyRepository } from '@/repositories/idempotency.repo';
import { PermissionRepository } from '@/repositories/permission.repo';
import {
  RoleRepository,
  UserRoleRepository,
  StaffInvitationRepository,
} from '@/repositories/role.repo';
import {
  PaymentProviderRepository,
  EmailProviderRepository,
  SmsProviderRepository,
} from '@/repositories/provider.repo';
import { PlatformSettingsRepository } from '@/repositories/platformSettings.repo';

// Services
import { RedisService } from '@/shared/services/redis.service';
import { IdempotencyService } from '@/shared/services/idempotency.service';
import { AuthService } from '@/modules/auth/auth.service';
import { ProductService } from '@/modules/product/product.service';
import { CartService } from '@/modules/cart/cart.service';
import { CheckoutService } from '@/modules/checkout/checkout.service';
import { PaymentService } from '@/modules/payment/payment.service';
import { CategoryService } from '@/modules/category/category.service';
import { RoleService } from '@/modules/roles/role.service';
import { StaffService } from '@/modules/staff/staff.service';
import { ProviderService } from '@/modules/providers/provider.service';
import { PlatformSettingsService } from '@/modules/platform/platform-settings.service';

// Controllers
import { AuthController } from '@/modules/auth/auth.controller';
import { CategoryController } from '@/modules/category/category.controller';
import { ProductController } from '@/modules/product/product.controller';
import { CartController } from '@/modules/cart/cart.controller';
import { CheckoutController } from '@/modules/checkout/checkout.controller';
import { PaymentController } from '@/modules/payment/payment.controller';
import { StripeWebhookHandler } from '@/modules/payment/webhooks/stripe.webhook';
import { RoleController } from '@/modules/roles/role.controller';
import { StaffController } from '@/modules/staff/staff.controller';
import { ProviderController } from '@/modules/providers/provider.controller';
import { PlatformSettingsController } from '@/modules/platform/platform-settings.controller';

function registerDependenciesInternal(): void {
  // Register repositories
  container.registerSingleton('TenantRepository', TenantRepository);
  container.registerSingleton('UserRepository', UserRepository);
  container.registerSingleton('ProductRepository', ProductRepository);
  container.registerSingleton('CategoryRepository', CategoryRepository);
  container.registerSingleton('CartRepository', CartRepository);
  container.registerSingleton('CartItemRepository', CartItemRepository);
  container.registerSingleton('OrderRepository', OrderRepository);
  container.registerSingleton('OrderItemRepository', OrderItemRepository);
  container.registerSingleton('DiscountRepository', DiscountRepository);
  container.registerSingleton('IdempotencyRepository', IdempotencyRepository);
  container.registerSingleton('PermissionRepository', PermissionRepository);
  container.registerSingleton('RoleRepository', RoleRepository);
  container.registerSingleton('UserRoleRepository', UserRoleRepository);
  container.registerSingleton('StaffInvitationRepository', StaffInvitationRepository);
  container.registerSingleton('PaymentProviderRepository', PaymentProviderRepository);
  container.registerSingleton('EmailProviderRepository', EmailProviderRepository);
  container.registerSingleton('SmsProviderRepository', SmsProviderRepository);
  container.registerSingleton('PlatformSettingsRepository', PlatformSettingsRepository);

  // Register shared services
  container.registerSingleton('RedisService', RedisService);
  container.registerSingleton('IdempotencyService', IdempotencyService);

  // Register module services
  container.registerSingleton('AuthService', AuthService);
  container.registerSingleton('ProductService', ProductService);
  container.registerSingleton('CartService', CartService);
  container.registerSingleton('CheckoutService', CheckoutService);
  container.registerSingleton('PaymentService', PaymentService);
  container.registerSingleton('CategoryService', CategoryService);
  container.registerSingleton('RoleService', RoleService);
  container.registerSingleton('StaffService', StaffService);
  container.registerSingleton('ProviderService', ProviderService);
  container.registerSingleton('PlatformSettingsService', PlatformSettingsService);

  // Register controllers
  container.registerSingleton(AuthController, AuthController);
  container.registerSingleton(ProductController, ProductController);
  container.registerSingleton(CartController, CartController);
  container.registerSingleton(CheckoutController, CheckoutController);
  container.registerSingleton(PaymentController, PaymentController);
  container.registerSingleton(StripeWebhookHandler, StripeWebhookHandler);
  container.registerSingleton(CategoryController, CategoryController);
  container.registerSingleton(RoleController, RoleController);
  container.registerSingleton(StaffController, StaffController);
  container.registerSingleton(ProviderController, ProviderController);
  container.registerSingleton(PlatformSettingsController, PlatformSettingsController);
}

// Register dependencies immediately when this module is imported
registerDependenciesInternal();

// Export for backward compatibility (already registered, this is a no-op)
export function registerDependencies(): void {
  // Dependencies already registered on module load
}
