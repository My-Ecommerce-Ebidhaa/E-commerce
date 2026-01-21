import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repo';
import { Cart, CartItem } from '@/models/Cart.model';
import { Transaction } from 'objection';

@injectable()
export class CartRepository extends BaseRepository<Cart> {
  constructor() {
    super(Cart);
  }

  async findByUserId(userId: string): Promise<Cart | undefined> {
    return Cart.query()
      .where('user_id', userId)
      .withGraphFetched('[items.[product.[media], variant]]')
      .first();
  }

  async findBySessionId(sessionId: string): Promise<Cart | undefined> {
    return Cart.query()
      .where('session_id', sessionId)
      .withGraphFetched('[items.[product.[media], variant]]')
      .first();
  }

  async findWithItems(cartId: string): Promise<Cart | undefined> {
    return Cart.query()
      .findById(cartId)
      .withGraphFetched('[items.[product.[media], variant]]');
  }

  async findOrCreateForUser(tenantId: string, userId: string): Promise<Cart> {
    let cart = await this.findByUserId(userId);

    if (!cart) {
      cart = await Cart.query().insert({
        tenant_id: tenantId,
        user_id: userId,
      });
    }

    return cart;
  }

  async findOrCreateForSession(tenantId: string, sessionId: string): Promise<Cart> {
    let cart = await this.findBySessionId(sessionId);

    if (!cart) {
      cart = await Cart.query().insert({
        tenant_id: tenantId,
        session_id: sessionId,
      });
    }

    return cart;
  }

  async mergeGuestCart(
    tenantId: string,
    userId: string,
    sessionId: string,
    trx?: Transaction
  ): Promise<Cart> {
    const query = trx ? Cart.query(trx) : Cart.query();
    const cartItemQuery = trx ? CartItem.query(trx) : CartItem.query();

    // Get user's cart (create if doesn't exist)
    let userCart = await query.where('user_id', userId).first();

    if (!userCart) {
      userCart = await query.insert({
        tenant_id: tenantId,
        user_id: userId,
      });
    }

    // Get guest cart
    const guestCart = await query.where('session_id', sessionId).first();

    if (guestCart) {
      // Get guest cart items
      const guestItems = await cartItemQuery.where('cart_id', guestCart.id);

      // Merge items into user cart
      for (const item of guestItems) {
        const existingItem = await cartItemQuery
          .where('cart_id', userCart.id)
          .where('product_id', item.product_id)
          .where('variant_id', item.variant_id || null)
          .first();

        if (existingItem) {
          // Add quantities
          await cartItemQuery
            .findById(existingItem.id)
            .patch({ quantity: existingItem.quantity + item.quantity });
        } else {
          // Move item to user cart
          await cartItemQuery.insert({
            cart_id: userCart.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          });
        }
      }

      // Copy discount if user cart doesn't have one
      if (guestCart.discount_code && !userCart.discount_code) {
        await query.findById(userCart.id).patch({
          discount_code: guestCart.discount_code,
          discount_amount: guestCart.discount_amount,
        });
      }

      // Delete guest cart (cascade deletes items)
      await query.deleteById(guestCart.id);
    }

    // Return merged cart with items
    return this.findWithItems(userCart.id) as Promise<Cart>;
  }

  async clearByUserId(userId: string, trx?: Transaction): Promise<void> {
    const query = trx ? Cart.query(trx) : Cart.query();
    await query.where('user_id', userId).delete();
  }

  async applyDiscount(
    cartId: string,
    code: string,
    amount: number
  ): Promise<Cart> {
    return Cart.query().patchAndFetchById(cartId, {
      discount_code: code,
      discount_amount: amount,
    });
  }

  async removeDiscount(cartId: string): Promise<Cart> {
    return Cart.query().patchAndFetchById(cartId, {
      discount_code: null,
      discount_amount: null,
    });
  }
}

@injectable()
export class CartItemRepository extends BaseRepository<CartItem> {
  constructor() {
    super(CartItem);
  }

  async findByCartAndProduct(
    cartId: string,
    productId: string,
    variantId?: string
  ): Promise<CartItem | undefined> {
    let query = CartItem.query()
      .where('cart_id', cartId)
      .where('product_id', productId);

    if (variantId) {
      query = query.where('variant_id', variantId);
    } else {
      query = query.whereNull('variant_id');
    }

    return query.first();
  }

  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
    variantId?: string
  ): Promise<CartItem> {
    const existingItem = await this.findByCartAndProduct(cartId, productId, variantId);

    if (existingItem) {
      return CartItem.query().patchAndFetchById(existingItem.id, {
        quantity: existingItem.quantity + quantity,
      });
    }

    return CartItem.query().insert({
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId,
      quantity,
    });
  }

  async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
    return CartItem.query().patchAndFetchById(itemId, { quantity });
  }

  async removeItem(itemId: string): Promise<number> {
    return CartItem.query().deleteById(itemId);
  }

  async clearCart(cartId: string): Promise<number> {
    return CartItem.query().where('cart_id', cartId).delete();
  }
}
