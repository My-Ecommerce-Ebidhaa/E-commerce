import { injectable, inject } from 'tsyringe';
import { transaction, Transaction } from 'objection';
import { CartService } from '@/modules/cart/cart.service';
import { OrderRepository } from '@/repositories/order.repo';
import { ProductRepository } from '@/repositories/product.repo';
import { DiscountRepository } from '@/repositories/discount.repo';
import { RedisService } from '@/shared/services/redis.service';
import { AppError } from '@/shared/errors/app.error';
import { Order } from '@/models/Order.model';
import { OrderItem } from '@/models/Order.model';
import { Cart } from '@/models/Cart.model';
import { CartItem } from '@/models/Cart.model';
import { Product } from '@/models/Product.model';
import { ProductVariant } from '@/models/ProductVariant.model';
import { InitiateCheckoutDto, AddressDto } from './dto/checkout.dto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/shared/logger';

interface ShippingRate {
  method: string;
  name: string;
  price: number;
  estimatedDays: number;
}

interface CheckoutSession {
  orderId: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  clientSecret?: string;
}

@injectable()
export class CheckoutService {
  private readonly INVENTORY_LOCK_TTL = 600; // 10 minutes

  constructor(
    @inject(CartService) private cartService: CartService,
    @inject(OrderRepository) private orderRepo: OrderRepository,
    @inject(ProductRepository) private productRepo: ProductRepository,
    @inject(DiscountRepository) private discountRepo: DiscountRepository,
    @inject(RedisService) private redisService: RedisService
  ) {}

  async calculateShipping(
    tenantId: string,
    postalCode: string,
    country: string
  ): Promise<ShippingRate[]> {
    // In production, this would integrate with shipping carriers
    // For now, return mock rates
    const rates: ShippingRate[] = [
      {
        method: 'standard',
        name: 'Standard Shipping',
        price: 5.99,
        estimatedDays: 5,
      },
      {
        method: 'express',
        name: 'Express Shipping',
        price: 12.99,
        estimatedDays: 2,
      },
      {
        method: 'overnight',
        name: 'Overnight Shipping',
        price: 24.99,
        estimatedDays: 1,
      },
    ];

    return rates;
  }

  async validateDiscount(
    tenantId: string,
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; discount: number; message?: string }> {
    const discount = await this.discountRepo.findByCode(tenantId, code);

    if (!discount) {
      return { valid: false, discount: 0, message: 'Invalid discount code' };
    }

    const now = new Date();

    if (discount.starts_at && new Date(discount.starts_at) > now) {
      return { valid: false, discount: 0, message: 'Discount code is not yet active' };
    }

    if (discount.ends_at && new Date(discount.ends_at) < now) {
      return { valid: false, discount: 0, message: 'Discount code has expired' };
    }

    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return { valid: false, discount: 0, message: 'Discount code usage limit reached' };
    }

    if (discount.minimum_amount && subtotal < Number(discount.minimum_amount)) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount of ${discount.minimum_amount} required`,
      };
    }

    let discountAmount = 0;

    if (discount.type === 'percentage') {
      discountAmount = (subtotal * Number(discount.value)) / 100;
      if (discount.maximum_discount) {
        discountAmount = Math.min(discountAmount, Number(discount.maximum_discount));
      }
    } else {
      discountAmount = Math.min(Number(discount.value), subtotal);
    }

    return { valid: true, discount: discountAmount };
  }

  async initiateCheckout(
    tenantId: string,
    userId: string | undefined,
    sessionId: string | undefined,
    dto: InitiateCheckoutDto
  ): Promise<CheckoutSession> {
    const cart = await this.cartService.getCart(tenantId, userId, sessionId);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400, 'EMPTY_CART');
    }

    const { subtotal } = this.cartService.calculateCartTotals(cart);

    // Calculate shipping
    const shippingRates = await this.calculateShipping(
      tenantId,
      dto.shippingAddress.postalCode,
      dto.shippingAddress.country
    );
    const selectedRate = shippingRates.find(r => r.method === dto.shippingMethod);
    const shippingCost = selectedRate?.price || 0;

    // Calculate discount
    let discountAmount = 0;
    if (dto.discountCode) {
      const discountResult = await this.validateDiscount(tenantId, dto.discountCode, subtotal);
      if (discountResult.valid) {
        discountAmount = discountResult.discount;
      }
    }

    // Calculate tax (simplified - in production would use tax service)
    const taxableAmount = subtotal - discountAmount;
    const taxRate = 0.08; // 8% default tax rate
    const tax = Math.round(taxableAmount * taxRate * 100) / 100;

    const total = subtotal + shippingCost - discountAmount + tax;

    // Validate inventory and create reservations
    const trx = await Order.startTransaction();

    try {
      // Lock inventory for all items
      await this.reserveInventory(cart, trx);

      // Create order
      const orderId = uuidv4();
      const orderNumber = await this.generateOrderNumber(tenantId);

      const billingAddress = dto.sameAsShipping
        ? dto.shippingAddress
        : dto.billingAddress || dto.shippingAddress;

      const order = await Order.query(trx).insert({
        id: orderId,
        tenant_id: tenantId,
        user_id: userId || null,
        order_number: orderNumber,
        status: 'pending_payment',
        payment_status: 'pending',
        subtotal,
        shipping_cost: shippingCost,
        discount: discountAmount,
        tax,
        total,
        shipping_address: dto.shippingAddress as any,
        billing_address: billingAddress as any,
        shipping_method: dto.shippingMethod,
        discount_code: dto.discountCode || null,
      });

      // Create order items
      for (const item of cart.items) {
        await OrderItem.query(trx).insert({
          id: uuidv4(),
          order_id: orderId,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: Number(item.unit_price) * item.quantity,
          product_snapshot: {
            name: item.product?.name,
            sku: item.product?.sku,
            images: item.product?.images,
          },
        });
      }

      // Increment discount usage if applicable
      if (dto.discountCode) {
        await this.discountRepo.incrementUsage(tenantId, dto.discountCode, trx);
      }

      await trx.commit();

      // Store checkout session in Redis
      const sessionKey = `checkout:${orderId}`;
      await this.redisService.set(
        sessionKey,
        JSON.stringify({
          orderId,
          cartId: cart.id,
          userId,
          sessionId,
          expiresAt: Date.now() + this.INVENTORY_LOCK_TTL * 1000,
        }),
        this.INVENTORY_LOCK_TTL
      );

      return {
        orderId,
        subtotal,
        shippingCost,
        discount: discountAmount,
        tax,
        total,
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  private async reserveInventory(cart: Cart, trx: Transaction): Promise<void> {
    for (const item of cart.items!) {
      // Acquire lock for this product/variant
      const lockKey = item.variant_id
        ? `inventory:variant:${item.variant_id}:lock`
        : `inventory:product:${item.product_id}:lock`;
      const lockValue = uuidv4();

      const lockAcquired = await this.redisService.acquireLock(lockKey, lockValue, 30);
      if (!lockAcquired) {
        throw new AppError(
          'Unable to process order, please try again',
          409,
          'INVENTORY_LOCK_FAILED'
        );
      }

      try {
        let currentStock: number;
        let entityName: string;

        if (item.variant_id) {
          const variant = await ProductVariant.query(trx)
            .findById(item.variant_id)
            .forUpdate();

          if (!variant) {
            throw new AppError('Product variant not found', 404, 'VARIANT_NOT_FOUND');
          }

          currentStock = variant.stock_quantity;
          entityName = `variant ${variant.sku}`;

          if (currentStock < item.quantity) {
            throw new AppError(
              `Insufficient stock for ${entityName}. Only ${currentStock} available.`,
              400,
              'INSUFFICIENT_STOCK'
            );
          }

          // Decrement stock
          await ProductVariant.query(trx)
            .patch({ stock_quantity: currentStock - item.quantity })
            .where('id', item.variant_id);
        } else {
          const product = await Product.query(trx)
            .findById(item.product_id)
            .forUpdate();

          if (!product) {
            throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
          }

          currentStock = product.stock_quantity;
          entityName = product.name;

          if (currentStock < item.quantity) {
            throw new AppError(
              `Insufficient stock for ${entityName}. Only ${currentStock} available.`,
              400,
              'INSUFFICIENT_STOCK'
            );
          }

          // Decrement stock
          await Product.query(trx)
            .patch({ stock_quantity: currentStock - item.quantity })
            .where('id', item.product_id);
        }

        logger.info('Inventory reserved', {
          productId: item.product_id,
          variantId: item.variant_id,
          quantity: item.quantity,
          remainingStock: currentStock - item.quantity,
        });
      } finally {
        await this.redisService.releaseLock(lockKey, lockValue);
      }
    }
  }

  async releaseInventory(orderId: string): Promise<void> {
    const order = await this.orderRepo.findByIdWithItems(orderId);
    if (!order || !order.items) return;

    const trx = await Order.startTransaction();

    try {
      for (const item of order.items) {
        if (item.variant_id) {
          await ProductVariant.query(trx)
            .increment('stock_quantity', item.quantity)
            .where('id', item.variant_id);
        } else {
          await Product.query(trx)
            .increment('stock_quantity', item.quantity)
            .where('id', item.product_id);
        }
      }

      // Update order status
      await Order.query(trx)
        .patch({ status: 'cancelled', payment_status: 'failed' })
        .where('id', orderId);

      await trx.commit();

      logger.info('Inventory released for order', { orderId });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async confirmOrder(orderId: string, paymentIntentId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (order.status !== 'pending_payment') {
      throw new AppError('Order cannot be confirmed', 400, 'INVALID_ORDER_STATUS');
    }

    await Order.query()
      .patch({
        status: 'confirmed',
        payment_status: 'paid',
        payment_intent_id: paymentIntentId,
        paid_at: new Date().toISOString(),
      })
      .where('id', orderId);

    // Clear the cart
    const sessionKey = `checkout:${orderId}`;
    const sessionData = await this.redisService.get(sessionKey);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      await CartItem.query().delete().where('cart_id', session.cartId);
    }

    await this.redisService.del(sessionKey);

    logger.info('Order confirmed', { orderId, paymentIntentId });

    return this.orderRepo.findById(orderId);
  }

  async cancelCheckout(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (order.status !== 'pending_payment') {
      throw new AppError('Order cannot be cancelled', 400, 'INVALID_ORDER_STATUS');
    }

    await this.releaseInventory(orderId);

    const sessionKey = `checkout:${orderId}`;
    await this.redisService.del(sessionKey);

    logger.info('Checkout cancelled', { orderId });
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const prefix = 'ORD';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  async getOrder(orderId: string, tenantId: string): Promise<Order | null> {
    const order = await this.orderRepo.findByIdWithItems(orderId);
    if (!order || order.tenant_id !== tenantId) {
      return null;
    }
    return order;
  }
}
