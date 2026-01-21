import { injectable, inject } from 'tsyringe';
import { transaction } from 'objection';
import { CartRepository } from '@/repositories/cart.repo';
import { ProductRepository } from '@/repositories/product.repo';
import { RedisService } from '@/shared/services/redis.service';
import { AppError } from '@/shared/errors/app-error';
import { Cart } from '@/models/Cart.model';
import { CartItem } from '@/models/CartItem.model';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class CartService {
  constructor(
    @inject(CartRepository) private cartRepo: CartRepository,
    @inject(ProductRepository) private productRepo: ProductRepository,
    @inject(RedisService) private redisService: RedisService
  ) {}

  async getOrCreateCart(tenantId: string, userId?: string, sessionId?: string): Promise<Cart> {
    let cart: Cart | undefined;

    if (userId) {
      cart = await this.cartRepo.findByUserId(tenantId, userId);
    } else if (sessionId) {
      cart = await this.cartRepo.findBySessionId(tenantId, sessionId);
    }

    if (!cart) {
      cart = await this.cartRepo.create({
        id: uuidv4(),
        tenant_id: tenantId,
        user_id: userId || null,
        session_id: sessionId || uuidv4(),
      });
    }

    return cart;
  }

  async getCart(tenantId: string, userId?: string, sessionId?: string): Promise<Cart | null> {
    let cart: Cart | undefined;

    if (userId) {
      cart = await this.cartRepo.findByUserId(tenantId, userId);
    } else if (sessionId) {
      cart = await this.cartRepo.findBySessionId(tenantId, sessionId);
    }

    if (!cart) {
      return null;
    }

    return this.cartRepo.getCartWithItems(cart.id);
  }

  async addToCart(
    tenantId: string,
    userId: string | undefined,
    sessionId: string | undefined,
    dto: AddToCartDto
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(tenantId, userId, sessionId);

    // Verify product exists and belongs to tenant
    const product = await this.productRepo.findByIdAndTenant(dto.productId, tenantId);
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.status !== 'active') {
      throw new AppError('Product is not available', 400, 'PRODUCT_UNAVAILABLE');
    }

    // Check stock availability
    let availableStock = product.stock_quantity;
    let unitPrice = product.price;

    if (dto.variantId) {
      const variant = await this.productRepo.findVariantById(dto.variantId);
      if (!variant || variant.product_id !== dto.productId) {
        throw new AppError('Product variant not found', 404, 'VARIANT_NOT_FOUND');
      }
      availableStock = variant.stock_quantity;
      unitPrice = variant.price || product.price;
    }

    // Use distributed lock for cart operations
    const lockKey = `cart:${cart.id}:lock`;
    const lockValue = uuidv4();
    const lockAcquired = await this.redisService.acquireLock(lockKey, lockValue, 10);

    if (!lockAcquired) {
      throw new AppError('Cart is being updated, please try again', 409, 'CART_LOCKED');
    }

    try {
      // Check if item already exists in cart
      const existingItem = await CartItem.query()
        .where('cart_id', cart.id)
        .where('product_id', dto.productId)
        .where(builder => {
          if (dto.variantId) {
            builder.where('variant_id', dto.variantId);
          } else {
            builder.whereNull('variant_id');
          }
        })
        .first();

      const newQuantity = existingItem
        ? existingItem.quantity + dto.quantity
        : dto.quantity;

      if (newQuantity > availableStock) {
        throw new AppError(
          `Only ${availableStock} items available in stock`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }

      if (existingItem) {
        await CartItem.query()
          .patch({ quantity: newQuantity })
          .where('id', existingItem.id);
      } else {
        await CartItem.query().insert({
          id: uuidv4(),
          cart_id: cart.id,
          product_id: dto.productId,
          variant_id: dto.variantId || null,
          quantity: dto.quantity,
          unit_price: unitPrice,
        });
      }

      return this.cartRepo.getCartWithItems(cart.id);
    } finally {
      await this.redisService.releaseLock(lockKey, lockValue);
    }
  }

  async updateCartItem(
    tenantId: string,
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: string,
    dto: UpdateCartItemDto
  ): Promise<Cart> {
    const cart = await this.getCart(tenantId, userId, sessionId);
    if (!cart) {
      throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
    }

    const cartItem = await CartItem.query()
      .where('id', itemId)
      .where('cart_id', cart.id)
      .first();

    if (!cartItem) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }

    // Check stock availability
    const product = await this.productRepo.findById(cartItem.product_id);
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    let availableStock = product.stock_quantity;

    if (cartItem.variant_id) {
      const variant = await this.productRepo.findVariantById(cartItem.variant_id);
      if (variant) {
        availableStock = variant.stock_quantity;
      }
    }

    if (dto.quantity > availableStock) {
      throw new AppError(
        `Only ${availableStock} items available in stock`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    await CartItem.query()
      .patch({ quantity: dto.quantity })
      .where('id', itemId);

    return this.cartRepo.getCartWithItems(cart.id);
  }

  async removeFromCart(
    tenantId: string,
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: string
  ): Promise<Cart> {
    const cart = await this.getCart(tenantId, userId, sessionId);
    if (!cart) {
      throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
    }

    const deleted = await CartItem.query()
      .delete()
      .where('id', itemId)
      .where('cart_id', cart.id);

    if (!deleted) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }

    return this.cartRepo.getCartWithItems(cart.id);
  }

  async clearCart(
    tenantId: string,
    userId: string | undefined,
    sessionId: string | undefined
  ): Promise<void> {
    const cart = await this.getCart(tenantId, userId, sessionId);
    if (!cart) {
      return;
    }

    await CartItem.query().delete().where('cart_id', cart.id);
  }

  async mergeGuestCart(
    tenantId: string,
    userId: string,
    sessionId: string
  ): Promise<Cart | null> {
    const guestCart = await this.cartRepo.findBySessionId(tenantId, sessionId);
    if (!guestCart) {
      return this.getCart(tenantId, userId, undefined);
    }

    let userCart = await this.cartRepo.findByUserId(tenantId, userId);

    if (!userCart) {
      // Simply assign the guest cart to the user
      await Cart.query()
        .patch({ user_id: userId })
        .where('id', guestCart.id);
      return this.cartRepo.getCartWithItems(guestCart.id);
    }

    // Merge guest cart items into user cart
    const trx = await Cart.startTransaction();

    try {
      const guestItems = await CartItem.query(trx)
        .where('cart_id', guestCart.id);

      for (const guestItem of guestItems) {
        const existingItem = await CartItem.query(trx)
          .where('cart_id', userCart.id)
          .where('product_id', guestItem.product_id)
          .where(builder => {
            if (guestItem.variant_id) {
              builder.where('variant_id', guestItem.variant_id);
            } else {
              builder.whereNull('variant_id');
            }
          })
          .first();

        if (existingItem) {
          await CartItem.query(trx)
            .patch({ quantity: existingItem.quantity + guestItem.quantity })
            .where('id', existingItem.id);
        } else {
          await CartItem.query(trx).insert({
            id: uuidv4(),
            cart_id: userCart.id,
            product_id: guestItem.product_id,
            variant_id: guestItem.variant_id,
            quantity: guestItem.quantity,
            unit_price: guestItem.unit_price,
          });
        }
      }

      // Delete guest cart
      await CartItem.query(trx).delete().where('cart_id', guestCart.id);
      await Cart.query(trx).deleteById(guestCart.id);

      await trx.commit();

      return this.cartRepo.getCartWithItems(userCart.id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  calculateCartTotals(cart: Cart): {
    subtotal: number;
    itemCount: number;
  } {
    if (!cart.items || cart.items.length === 0) {
      return { subtotal: 0, itemCount: 0 };
    }

    let subtotal = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      subtotal += Number(item.unit_price) * item.quantity;
      itemCount += item.quantity;
    }

    return { subtotal, itemCount };
  }
}
