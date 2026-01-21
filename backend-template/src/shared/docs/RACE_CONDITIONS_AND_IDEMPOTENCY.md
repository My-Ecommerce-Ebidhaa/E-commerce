# Race Conditions & Idempotency Strategy

## Overview

E-commerce platforms face critical race conditions in:
- **Inventory**: Overselling when multiple users buy the last item
- **Cart**: Concurrent updates from multiple tabs/devices
- **Orders**: Duplicate order creation from retries
- **Payments**: Double-charging from network retries
- **Discounts**: Exceeding usage limits

We use a **two-layer approach**:
1. **Redis Locks** (fast path) - Atomic operations using `SET NX`
2. **Database Idempotency Records** (persistent) - Token-based deduplication

---

## 1. Redis Locking Pattern

### Core Lock Utility

```typescript
// src/shared/services/redis.service.ts
import { injectable } from 'tsyringe';
import Redis from 'ioredis';
import { config } from '@/config';

@injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis(config.redis.url);
  }

  /**
   * Acquire a distributed lock using Redis SET NX
   * @param key - Lock key
   * @param value - Lock value (for identification)
   * @param ttlSeconds - Lock expiration time
   * @returns true if lock acquired, false if already locked
   */
  async acquireLock(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  /**
   * Release a lock (only if we own it)
   */
  async releaseLock(key: string, value: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, key, value);
    return result === 1;
  }

  /**
   * Extend lock TTL (for long-running operations)
   */
  async extendLock(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("expire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, key, value, ttlSeconds);
    return result === 1;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async incrBy(key: string, amount: number): Promise<number> {
    return this.client.incrby(key, amount);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async decrBy(key: string, amount: number): Promise<number> {
    return this.client.decrby(key, amount);
  }
}
```

### Lock Key Patterns

```typescript
// src/shared/constants/lock-keys.ts
export const LockKeys = {
  // Inventory operations
  INVENTORY_UPDATE: (productId: string, variantId?: string) =>
    `lock:inventory:${productId}${variantId ? `:${variantId}` : ''}`,

  // Cart operations
  CART_UPDATE: (cartId: string) => `lock:cart:${cartId}`,

  // Order operations
  ORDER_CREATE: (cartId: string) => `lock:order:create:${cartId}`,
  ORDER_UPDATE: (orderId: string) => `lock:order:update:${orderId}`,

  // Payment operations
  PAYMENT_PROCESS: (orderId: string) => `lock:payment:${orderId}`,

  // Discount operations
  DISCOUNT_REDEEM: (code: string) => `lock:discount:${code}`,

  // User operations
  USER_CART_MERGE: (userId: string) => `lock:cart:merge:${userId}`,
} as const;

export const LockTTL = {
  INVENTORY: 30,      // 30 seconds
  CART: 10,           // 10 seconds
  ORDER_CREATE: 60,   // 60 seconds
  ORDER_UPDATE: 30,   // 30 seconds
  PAYMENT: 120,       // 2 minutes
  DISCOUNT: 10,       // 10 seconds
  CART_MERGE: 30,     // 30 seconds
} as const;
```

---

## 2. Idempotency System

### Idempotency Model & Migration

```typescript
// src/database/migrations/20240101000010_create_idempotency_records.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('idempotency_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants');
    table.string('idempotency_key', 255).notNullable();
    table.string('request_type', 50).notNullable(); // checkout, payment, order_update, etc.
    table.string('request_path', 255);
    table.string('request_method', 10);
    table.jsonb('request_hash').notNullable(); // Hash of request body
    table.jsonb('response_data'); // Cached response for replays
    table.integer('response_status');
    table.integer('attempts').defaultTo(1);
    table.string('status', 20).defaultTo('processing'); // processing, completed, failed
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['tenant_id', 'idempotency_key']);
    table.index(['tenant_id', 'expires_at']);
    table.index(['status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('idempotency_records');
}
```

### Idempotency Repository

```typescript
// src/repositories/idempotency.repo.ts
import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repo';
import { IdempotencyRecord } from '@/models/IdempotencyRecord.model';

@injectable()
export class IdempotencyRepository extends BaseRepository<IdempotencyRecord> {
  constructor() {
    super(IdempotencyRecord);
  }

  async findByKey(tenantId: string, key: string): Promise<IdempotencyRecord | undefined> {
    return this.model
      .query()
      .where({ tenant_id: tenantId, idempotency_key: key })
      .where('expires_at', '>', new Date())
      .first();
  }

  async createRecord(data: {
    tenantId: string;
    idempotencyKey: string;
    requestType: string;
    requestPath: string;
    requestMethod: string;
    requestHash: object;
    expiresAt: Date;
  }): Promise<IdempotencyRecord> {
    return this.model.query().insert({
      tenant_id: data.tenantId,
      idempotency_key: data.idempotencyKey,
      request_type: data.requestType,
      request_path: data.requestPath,
      request_method: data.requestMethod,
      request_hash: data.requestHash,
      expires_at: data.expiresAt,
      status: 'processing',
    });
  }

  async markCompleted(
    id: string,
    responseData: object,
    responseStatus: number
  ): Promise<void> {
    await this.model.query().patchAndFetchById(id, {
      status: 'completed',
      response_data: responseData,
      response_status: responseStatus,
      updated_at: new Date(),
    });
  }

  async markFailed(id: string): Promise<void> {
    await this.model.query().patchAndFetchById(id, {
      status: 'failed',
      updated_at: new Date(),
    });
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.model.query().findById(id).increment('attempts', 1);
  }

  async cleanupExpired(): Promise<number> {
    return this.model.query().where('expires_at', '<', new Date()).delete();
  }
}
```

### Idempotency Service

```typescript
// src/shared/services/idempotency.service.ts
import { injectable, inject } from 'tsyringe';
import { createHash } from 'crypto';
import { IdempotencyRepository } from '@/repositories/idempotency.repo';
import { RedisService } from './redis.service';
import { AppError } from '@/shared/errors/app.error';
import httpStatus from 'http-status';

export interface IdempotencyCheckResult {
  isNew: boolean;
  recordId?: string;
  cachedResponse?: {
    data: object;
    status: number;
  };
}

@injectable()
export class IdempotencyService {
  private readonly DEFAULT_EXPIRY_MINUTES = 30;

  constructor(
    @inject('IdempotencyRepository') private idempotencyRepo: IdempotencyRepository,
    @inject('RedisService') private redis: RedisService,
  ) {}

  /**
   * Check if request is duplicate and handle accordingly
   */
  async check(params: {
    tenantId: string;
    idempotencyKey: string;
    requestType: string;
    requestPath: string;
    requestMethod: string;
    requestBody: object;
    expiryMinutes?: number;
  }): Promise<IdempotencyCheckResult> {
    const {
      tenantId,
      idempotencyKey,
      requestType,
      requestPath,
      requestMethod,
      requestBody,
      expiryMinutes = this.DEFAULT_EXPIRY_MINUTES,
    } = params;

    // Generate hash of request body for validation
    const requestHash = this.hashRequestBody(requestBody);

    // First, try Redis for quick lookup (processing requests)
    const redisKey = `idempotency:${tenantId}:${idempotencyKey}`;
    const processingLock = await this.redis.get(redisKey);

    if (processingLock) {
      // Request is currently being processed
      throw new AppError(
        httpStatus.CONFLICT,
        'Request is currently being processed. Please wait.',
        'REQUEST_IN_PROGRESS'
      );
    }

    // Check database for existing record
    const existingRecord = await this.idempotencyRepo.findByKey(tenantId, idempotencyKey);

    if (existingRecord) {
      // Validate request body matches
      if (JSON.stringify(existingRecord.request_hash) !== JSON.stringify(requestHash)) {
        throw new AppError(
          httpStatus.UNPROCESSABLE_ENTITY,
          'Idempotency key already used with different request parameters',
          'IDEMPOTENCY_KEY_REUSED'
        );
      }

      await this.idempotencyRepo.incrementAttempts(existingRecord.id);

      if (existingRecord.status === 'completed' && existingRecord.response_data) {
        // Return cached response
        return {
          isNew: false,
          recordId: existingRecord.id,
          cachedResponse: {
            data: existingRecord.response_data,
            status: existingRecord.response_status || 200,
          },
        };
      }

      if (existingRecord.status === 'processing') {
        throw new AppError(
          httpStatus.CONFLICT,
          'Request is currently being processed',
          'REQUEST_IN_PROGRESS'
        );
      }

      // Status is 'failed' - allow retry
    }

    // Set Redis lock for processing
    await this.redis.set(redisKey, 'processing', expiryMinutes * 60);

    // Create or update record
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    let recordId: string;
    if (existingRecord) {
      // Update existing failed record
      await this.idempotencyRepo.update(existingRecord.id, {
        status: 'processing',
        updated_at: new Date(),
      });
      recordId = existingRecord.id;
    } else {
      // Create new record
      const record = await this.idempotencyRepo.createRecord({
        tenantId,
        idempotencyKey,
        requestType,
        requestPath,
        requestMethod,
        requestHash,
        expiresAt,
      });
      recordId = record.id;
    }

    return { isNew: true, recordId };
  }

  /**
   * Mark request as completed and cache response
   */
  async complete(
    tenantId: string,
    idempotencyKey: string,
    recordId: string,
    responseData: object,
    responseStatus: number
  ): Promise<void> {
    await this.idempotencyRepo.markCompleted(recordId, responseData, responseStatus);

    // Remove processing lock
    const redisKey = `idempotency:${tenantId}:${idempotencyKey}`;
    await this.redis.del(redisKey);
  }

  /**
   * Mark request as failed (allows retry)
   */
  async fail(tenantId: string, idempotencyKey: string, recordId: string): Promise<void> {
    await this.idempotencyRepo.markFailed(recordId);

    // Remove processing lock
    const redisKey = `idempotency:${tenantId}:${idempotencyKey}`;
    await this.redis.del(redisKey);
  }

  private hashRequestBody(body: object): object {
    const hash = createHash('sha256')
      .update(JSON.stringify(body))
      .digest('hex');
    return { hash };
  }
}
```

### Idempotency Middleware

```typescript
// src/shared/middlewares/idempotency.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IdempotencyService } from '@/shared/services/idempotency.service';
import { ErrorResponse } from '@/shared/utils/response.util';

export interface IdempotencyConfig {
  requestType: string;
  expiryMinutes?: number;
  headerName?: string;
}

/**
 * Middleware factory for idempotency checking
 */
export function idempotencyMiddleware(config: IdempotencyConfig) {
  const { requestType, expiryMinutes = 30, headerName = 'Idempotency-Key' } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.headers[headerName.toLowerCase()] as string;

    // If no idempotency key provided, skip check (optional for some endpoints)
    if (!idempotencyKey) {
      return next();
    }

    const idempotencyService = container.resolve(IdempotencyService);

    try {
      const result = await idempotencyService.check({
        tenantId: req.tenant.id,
        idempotencyKey,
        requestType,
        requestPath: req.path,
        requestMethod: req.method,
        requestBody: req.body,
        expiryMinutes,
      });

      if (!result.isNew && result.cachedResponse) {
        // Return cached response
        return res.status(result.cachedResponse.status).json(result.cachedResponse.data);
      }

      // Attach record ID to request for later completion
      req.idempotencyRecordId = result.recordId;
      req.idempotencyKey = idempotencyKey;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to mark idempotent request as completed
 * Use this in response interceptor or after successful operation
 */
export function completeIdempotency() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      // Complete idempotency record after successful response
      if (req.idempotencyRecordId && req.idempotencyKey) {
        const idempotencyService = container.resolve(IdempotencyService);
        idempotencyService
          .complete(
            req.tenant.id,
            req.idempotencyKey,
            req.idempotencyRecordId,
            data,
            res.statusCode
          )
          .catch(console.error); // Fire and forget
      }

      return originalJson(data);
    };

    next();
  };
}
```

---

## 3. Domain-Specific Implementations

### Inventory Service (Preventing Overselling)

```typescript
// src/modules/inventory/inventory.service.ts
import { injectable, inject } from 'tsyringe';
import { ProductRepository } from '@/repositories/product.repo';
import { ProductVariantRepository } from '@/repositories/product-variant.repo';
import { RedisService } from '@/shared/services/redis.service';
import { LockKeys, LockTTL } from '@/shared/constants/lock-keys';
import { AppError } from '@/shared/errors/app.error';
import httpStatus from 'http-status';

@injectable()
export class InventoryService {
  constructor(
    @inject('ProductRepository') private productRepo: ProductRepository,
    @inject('ProductVariantRepository') private variantRepo: ProductVariantRepository,
    @inject('RedisService') private redis: RedisService,
  ) {}

  /**
   * Reserve inventory for checkout (with distributed lock)
   */
  async reserveInventory(items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>): Promise<{ success: boolean; reservationId: string }> {
    const reservationId = crypto.randomUUID();
    const locksAcquired: string[] = [];
    const reservations: Array<{ key: string; quantity: number }> = [];

    try {
      // Acquire locks for all items first (prevent deadlock with consistent ordering)
      const sortedItems = [...items].sort((a, b) =>
        `${a.productId}:${a.variantId}`.localeCompare(`${b.productId}:${b.variantId}`)
      );

      for (const item of sortedItems) {
        const lockKey = LockKeys.INVENTORY_UPDATE(item.productId, item.variantId);
        const lockAcquired = await this.redis.acquireLock(
          lockKey,
          reservationId,
          LockTTL.INVENTORY
        );

        if (!lockAcquired) {
          throw new AppError(
            httpStatus.CONFLICT,
            'Unable to process order. Please try again.',
            'INVENTORY_LOCK_FAILED'
          );
        }

        locksAcquired.push(lockKey);
      }

      // Check and reserve inventory
      for (const item of sortedItems) {
        const currentQty = item.variantId
          ? await this.variantRepo.getQuantity(item.variantId)
          : await this.productRepo.getQuantity(item.productId);

        if (currentQty < item.quantity) {
          throw new AppError(
            httpStatus.CONFLICT,
            `Insufficient inventory for product`,
            'INSUFFICIENT_INVENTORY'
          );
        }

        // Decrement inventory
        if (item.variantId) {
          await this.variantRepo.decrementQuantity(item.variantId, item.quantity);
        } else {
          await this.productRepo.decrementQuantity(item.productId, item.quantity);
        }

        // Track reservation for potential rollback
        const reservationKey = `reservation:${reservationId}:${item.productId}:${item.variantId || 'main'}`;
        reservations.push({ key: reservationKey, quantity: item.quantity });
        await this.redis.set(reservationKey, item.quantity.toString(), 900); // 15 min TTL
      }

      return { success: true, reservationId };
    } catch (error) {
      // Rollback any reservations made
      for (const reservation of reservations) {
        try {
          const [, , productId, variantId] = reservation.key.split(':');
          if (variantId !== 'main') {
            await this.variantRepo.incrementQuantity(variantId, reservation.quantity);
          } else {
            await this.productRepo.incrementQuantity(productId, reservation.quantity);
          }
        } catch (rollbackError) {
          console.error('Reservation rollback failed:', rollbackError);
        }
      }
      throw error;
    } finally {
      // Release all locks
      for (const lockKey of locksAcquired) {
        await this.redis.releaseLock(lockKey, reservationId);
      }
    }
  }

  /**
   * Release reserved inventory (payment failed, order cancelled)
   */
  async releaseInventory(reservationId: string): Promise<void> {
    // Find all reservation keys
    const pattern = `reservation:${reservationId}:*`;
    // Note: In production, use SCAN instead of KEYS
    const keys = await this.redis.keys(pattern);

    for (const key of keys) {
      const quantity = parseInt(await this.redis.get(key) || '0', 10);
      if (quantity > 0) {
        const [, , productId, variantId] = key.split(':');

        if (variantId !== 'main') {
          await this.variantRepo.incrementQuantity(variantId, quantity);
        } else {
          await this.productRepo.incrementQuantity(productId, quantity);
        }

        await this.redis.del(key);
      }
    }
  }

  /**
   * Confirm reservation (payment succeeded)
   */
  async confirmReservation(reservationId: string): Promise<void> {
    // Simply delete reservation keys (inventory already decremented)
    const pattern = `reservation:${reservationId}:*`;
    const keys = await this.redis.keys(pattern);

    for (const key of keys) {
      await this.redis.del(key);
    }
  }
}
```

### Checkout Service (Idempotent Order Creation)

```typescript
// src/modules/checkout/checkout.service.ts
import { injectable, inject } from 'tsyringe';
import { CartRepository } from '@/repositories/cart.repo';
import { OrderRepository } from '@/repositories/order.repo';
import { InventoryService } from '@/modules/inventory/inventory.service';
import { PaymentService } from '@/modules/payment/payment.service';
import { RedisService } from '@/shared/services/redis.service';
import { LockKeys, LockTTL } from '@/shared/constants/lock-keys';
import { AppError } from '@/shared/errors/app.error';
import httpStatus from 'http-status';
import { Knex } from 'knex';

@injectable()
export class CheckoutService {
  constructor(
    @inject('CartRepository') private cartRepo: CartRepository,
    @inject('OrderRepository') private orderRepo: OrderRepository,
    @inject('InventoryService') private inventoryService: InventoryService,
    @inject('PaymentService') private paymentService: PaymentService,
    @inject('RedisService') private redis: RedisService,
    @inject('Knex') private knex: Knex,
  ) {}

  /**
   * Create checkout session - idempotent operation
   */
  async createCheckout(params: {
    tenantId: string;
    cartId: string;
    userId?: string;
    email: string;
    shippingAddress: object;
    billingAddress: object;
    shippingMethod: string;
  }): Promise<CheckoutResult> {
    const { tenantId, cartId } = params;
    const lockValue = crypto.randomUUID();

    // Acquire lock on cart to prevent concurrent checkouts
    const lockKey = LockKeys.ORDER_CREATE(cartId);
    const lockAcquired = await this.redis.acquireLock(
      lockKey,
      lockValue,
      LockTTL.ORDER_CREATE
    );

    if (!lockAcquired) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Checkout already in progress for this cart',
        'CHECKOUT_IN_PROGRESS'
      );
    }

    try {
      // Get cart with items
      const cart = await this.cartRepo.findWithItems(cartId);
      if (!cart || cart.items.length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Cart is empty', 'EMPTY_CART');
      }

      // Reserve inventory
      const inventoryItems = cart.items.map(item => ({
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
      }));

      const reservation = await this.inventoryService.reserveInventory(inventoryItems);

      // Use database transaction for order creation
      const order = await this.knex.transaction(async (trx) => {
        // Calculate totals
        const subtotal = this.calculateSubtotal(cart.items);
        const shippingCost = await this.calculateShipping(params.shippingMethod, cart.items);
        const taxAmount = await this.calculateTax(subtotal, params.shippingAddress);
        const discountAmount = cart.discount_amount || 0;
        const total = subtotal + shippingCost + taxAmount - discountAmount;

        // Create order
        const order = await this.orderRepo.create({
          tenant_id: tenantId,
          user_id: params.userId,
          order_number: await this.generateOrderNumber(tenantId),
          email: params.email,
          shipping_address: params.shippingAddress,
          billing_address: params.billingAddress,
          subtotal,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total,
          status: 'pending',
          payment_status: 'pending',
          fulfillment_status: 'unfulfilled',
          shipping_method: params.shippingMethod,
          reservation_id: reservation.reservationId,
        }, trx);

        // Create order items
        const orderItems = cart.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.product.name,
          sku: item.variant?.sku || item.product.sku,
          price: item.variant?.price || item.product.price,
          quantity: item.quantity,
        }));

        await this.orderRepo.createItems(orderItems, trx);

        return order;
      });

      // Create payment intent
      const paymentIntent = await this.paymentService.createPaymentIntent({
        orderId: order.id,
        amount: order.total,
        currency: 'usd',
        metadata: {
          order_number: order.order_number,
          tenant_id: tenantId,
        },
      });

      // Update order with payment intent ID
      await this.orderRepo.update(order.id, {
        payment_intent_id: paymentIntent.id,
      });

      return {
        orderId: order.id,
        orderNumber: order.order_number,
        clientSecret: paymentIntent.clientSecret,
        total: order.total,
      };
    } catch (error) {
      // If we have a reservation and something failed, release it
      // The inventory service handles this internally on errors
      throw error;
    } finally {
      // Always release the lock
      await this.redis.releaseLock(lockKey, lockValue);
    }
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const key = `order_seq:${tenantId}:${year}`;
    const seq = await this.redis.incr(key);

    // Set expiry to end of year + 1 day if this is a new key
    if (seq === 1) {
      const endOfYear = new Date(year + 1, 0, 1).getTime();
      const ttl = Math.floor((endOfYear - Date.now()) / 1000);
      await this.redis.expire(key, ttl);
    }

    return `ORD-${year}-${seq.toString().padStart(6, '0')}`;
  }
}
```

### Payment Webhook Handler (Idempotent)

```typescript
// src/modules/payment/webhooks/stripe.webhook.ts
import { injectable, inject } from 'tsyringe';
import { OrderRepository } from '@/repositories/order.repo';
import { InventoryService } from '@/modules/inventory/inventory.service';
import { NotificationService } from '@/modules/notification/notification.service';
import { RedisService } from '@/shared/services/redis.service';
import { AppError } from '@/shared/errors/app.error';

@injectable()
export class StripeWebhookHandler {
  constructor(
    @inject('OrderRepository') private orderRepo: OrderRepository,
    @inject('InventoryService') private inventoryService: InventoryService,
    @inject('NotificationService') private notificationService: NotificationService,
    @inject('RedisService') private redis: RedisService,
  ) {}

  /**
   * Handle Stripe webhook events - idempotent processing
   */
  async handleEvent(event: StripeEvent): Promise<void> {
    // Check if event already processed (Stripe may send duplicates)
    const eventKey = `stripe_event:${event.id}`;
    const alreadyProcessed = await this.redis.get(eventKey);

    if (alreadyProcessed) {
      console.log(`Stripe event ${event.id} already processed, skipping`);
      return;
    }

    // Mark event as processing (with lock)
    const lockAcquired = await this.redis.acquireLock(eventKey, 'processing', 300);
    if (!lockAcquired) {
      console.log(`Stripe event ${event.id} is being processed by another worker`);
      return;
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        // ... other event types
      }

      // Mark as successfully processed (keep for 7 days)
      await this.redis.set(eventKey, 'completed', 7 * 24 * 60 * 60);
    } catch (error) {
      // Mark as failed but still prevent reprocessing of corrupted events
      await this.redis.set(eventKey, 'failed', 24 * 60 * 60);
      throw error;
    }
  }

  private async handlePaymentSucceeded(paymentIntent: StripePaymentIntent): Promise<void> {
    const order = await this.orderRepo.findByPaymentIntentId(paymentIntent.id);
    if (!order) {
      throw new AppError(404, `Order not found for payment intent: ${paymentIntent.id}`);
    }

    // Skip if already marked as paid (idempotent)
    if (order.payment_status === 'paid') {
      console.log(`Order ${order.id} already marked as paid`);
      return;
    }

    // Update order status
    await this.orderRepo.update(order.id, {
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: paymentIntent.payment_method_types[0],
    });

    // Confirm inventory reservation
    if (order.reservation_id) {
      await this.inventoryService.confirmReservation(order.reservation_id);
    }

    // Clear the user's cart
    if (order.user_id) {
      await this.cartRepo.clearByUserId(order.user_id);
    }

    // Send confirmation email (fire and forget)
    this.notificationService.sendOrderConfirmation(order).catch(console.error);
  }

  private async handlePaymentFailed(paymentIntent: StripePaymentIntent): Promise<void> {
    const order = await this.orderRepo.findByPaymentIntentId(paymentIntent.id);
    if (!order) return;

    // Skip if already processed
    if (order.payment_status === 'failed') return;

    // Update order status
    await this.orderRepo.update(order.id, {
      payment_status: 'failed',
    });

    // Release inventory reservation
    if (order.reservation_id) {
      await this.inventoryService.releaseInventory(order.reservation_id);
    }
  }
}
```

### Discount Redemption (Race Condition Prevention)

```typescript
// src/modules/cart/discount.service.ts
import { injectable, inject } from 'tsyringe';
import { DiscountRepository } from '@/repositories/discount.repo';
import { RedisService } from '@/shared/services/redis.service';
import { LockKeys, LockTTL } from '@/shared/constants/lock-keys';
import { AppError } from '@/shared/errors/app.error';
import httpStatus from 'http-status';

@injectable()
export class DiscountService {
  constructor(
    @inject('DiscountRepository') private discountRepo: DiscountRepository,
    @inject('RedisService') private redis: RedisService,
  ) {}

  /**
   * Apply discount code - with race condition prevention
   */
  async applyDiscount(params: {
    tenantId: string;
    code: string;
    cartSubtotal: number;
  }): Promise<{ discountAmount: number; discountType: string }> {
    const { tenantId, code, cartSubtotal } = params;
    const lockValue = crypto.randomUUID();

    // Acquire lock on discount code
    const lockKey = LockKeys.DISCOUNT_REDEEM(code);
    const lockAcquired = await this.redis.acquireLock(lockKey, lockValue, LockTTL.DISCOUNT);

    if (!lockAcquired) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Discount code is being processed. Please try again.',
        'DISCOUNT_LOCK_FAILED'
      );
    }

    try {
      // Find discount
      const discount = await this.discountRepo.findByCode(tenantId, code);

      if (!discount) {
        throw new AppError(httpStatus.NOT_FOUND, 'Invalid discount code', 'INVALID_DISCOUNT');
      }

      // Validate discount
      this.validateDiscount(discount, cartSubtotal);

      // Calculate discount amount
      let discountAmount: number;
      if (discount.type === 'percentage') {
        discountAmount = (cartSubtotal * discount.value) / 100;
      } else if (discount.type === 'fixed_amount') {
        discountAmount = Math.min(discount.value, cartSubtotal);
      } else {
        discountAmount = 0; // free_shipping handled separately
      }

      return {
        discountAmount,
        discountType: discount.type,
      };
    } finally {
      await this.redis.releaseLock(lockKey, lockValue);
    }
  }

  /**
   * Redeem discount - increment usage count atomically
   */
  async redeemDiscount(tenantId: string, code: string): Promise<void> {
    const lockValue = crypto.randomUUID();
    const lockKey = LockKeys.DISCOUNT_REDEEM(code);

    const lockAcquired = await this.redis.acquireLock(lockKey, lockValue, LockTTL.DISCOUNT);
    if (!lockAcquired) {
      throw new AppError(httpStatus.CONFLICT, 'Please try again', 'DISCOUNT_LOCK_FAILED');
    }

    try {
      const discount = await this.discountRepo.findByCode(tenantId, code);
      if (!discount) return;

      // Check max uses again (double-check within lock)
      if (discount.max_uses && discount.used_count >= discount.max_uses) {
        throw new AppError(
          httpStatus.GONE,
          'Discount code has reached maximum uses',
          'DISCOUNT_EXHAUSTED'
        );
      }

      // Atomic increment
      await this.discountRepo.incrementUsedCount(discount.id);
    } finally {
      await this.redis.releaseLock(lockKey, lockValue);
    }
  }

  private validateDiscount(discount: Discount, cartSubtotal: number): void {
    const now = new Date();

    if (!discount.is_active) {
      throw new AppError(httpStatus.GONE, 'Discount code is inactive', 'DISCOUNT_INACTIVE');
    }

    if (discount.starts_at > now) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Discount code is not yet active', 'DISCOUNT_NOT_STARTED');
    }

    if (discount.ends_at && discount.ends_at < now) {
      throw new AppError(httpStatus.GONE, 'Discount code has expired', 'DISCOUNT_EXPIRED');
    }

    if (discount.max_uses && discount.used_count >= discount.max_uses) {
      throw new AppError(httpStatus.GONE, 'Discount code has reached maximum uses', 'DISCOUNT_EXHAUSTED');
    }

    if (discount.min_purchase && cartSubtotal < discount.min_purchase) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Minimum purchase of $${discount.min_purchase} required`,
        'DISCOUNT_MIN_NOT_MET'
      );
    }
  }
}
```

---

## 4. Route Configuration

```typescript
// src/modules/checkout/checkout.route.ts
import { Router } from 'express';
import { container } from 'tsyringe';
import { CheckoutController } from './checkout.controller';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { tenantMiddleware } from '@/shared/middlewares/tenant.middleware';
import { validateMiddleware } from '@/shared/middlewares/validate.middleware';
import { idempotencyMiddleware, completeIdempotency } from '@/shared/middlewares/idempotency.middleware';
import { createCheckoutSchema } from './dto/create-checkout.dto';

const router = Router();
const controller = container.resolve(CheckoutController);

// Checkout requires idempotency key for safety
router.post(
  '/checkout',
  tenantMiddleware,
  authMiddleware({ optional: true }), // Allow guest checkout
  validateMiddleware(createCheckoutSchema),
  idempotencyMiddleware({ requestType: 'checkout', expiryMinutes: 60 }),
  completeIdempotency(),
  controller.createCheckout
);

// Payment confirmation (also idempotent)
router.post(
  '/checkout/confirm',
  tenantMiddleware,
  idempotencyMiddleware({ requestType: 'payment_confirm', expiryMinutes: 60 }),
  completeIdempotency(),
  controller.confirmPayment
);

export default router;
```

---

## 5. Summary

### Race Condition Prevention

| Scenario | Solution |
|----------|----------|
| Inventory overselling | Redis distributed locks + atomic DB operations |
| Concurrent cart updates | Lock on cart ID during modifications |
| Duplicate order creation | Lock on cart ID during checkout |
| Discount over-redemption | Lock on discount code + atomic increment |
| Concurrent payment processing | Lock on order ID |

### Idempotency Handling

| Operation | Key Source | Expiry | Behavior |
|-----------|------------|--------|----------|
| Checkout | `Idempotency-Key` header | 60 min | Return cached order |
| Payment confirm | `Idempotency-Key` header | 60 min | Return cached result |
| Webhooks | Event ID | 7 days | Skip duplicate events |
| Order status update | Lock on order | 30 sec | Prevent concurrent updates |

### Key Patterns

1. **Two-Phase Locking**: Acquire all locks before mutations, release after
2. **Optimistic → Pessimistic**: Try optimistic first, fall back to pessimistic on conflict
3. **Reservation Pattern**: Reserve resources, confirm on success, release on failure
4. **Idempotency Keys**: Client-provided keys for safe retries
5. **Event Deduplication**: Track processed webhook event IDs
6. **Request Hashing**: Ensure same idempotency key = same request body
