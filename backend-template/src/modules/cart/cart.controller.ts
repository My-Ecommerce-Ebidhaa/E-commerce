import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { ApiResponse } from '@/shared/utils/response.util';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@injectable()
export class CartController {
  constructor(@inject(CartService) private cartService: CartService) {}

  getCart = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string | undefined;

    const cart = await this.cartService.getCart(tenantId, userId, sessionId);

    if (!cart) {
      res.json(ApiResponse.success({ items: [], subtotal: 0, itemCount: 0 }));
      return;
    }

    const totals = this.cartService.calculateCartTotals(cart);

    res.json(ApiResponse.success({
      id: cart.id,
      items: cart.items?.map(item => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          images: item.product.images,
        } : null,
        variant: item.variant ? {
          id: item.variant.id,
          sku: item.variant.sku,
          options: item.variant.options,
        } : null,
      })) || [],
      ...totals,
    }));
  };

  addToCart = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const dto: AddToCartDto = req.body;

    const cart = await this.cartService.addToCart(tenantId, userId, sessionId, dto);
    const totals = this.cartService.calculateCartTotals(cart);

    res.status(201).json(ApiResponse.success({
      id: cart.id,
      items: cart.items?.map(item => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          images: item.product.images,
        } : null,
        variant: item.variant ? {
          id: item.variant.id,
          sku: item.variant.sku,
          options: item.variant.options,
        } : null,
      })) || [],
      ...totals,
    }, 'Item added to cart'));
  };

  updateCartItem = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const { itemId } = req.params;
    const dto: UpdateCartItemDto = req.body;

    const cart = await this.cartService.updateCartItem(
      tenantId,
      userId,
      sessionId,
      itemId,
      dto
    );
    const totals = this.cartService.calculateCartTotals(cart);

    res.json(ApiResponse.success({
      id: cart.id,
      items: cart.items?.map(item => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          images: item.product.images,
        } : null,
        variant: item.variant ? {
          id: item.variant.id,
          sku: item.variant.sku,
          options: item.variant.options,
        } : null,
      })) || [],
      ...totals,
    }, 'Cart updated'));
  };

  removeFromCart = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const { itemId } = req.params;

    const cart = await this.cartService.removeFromCart(
      tenantId,
      userId,
      sessionId,
      itemId
    );
    const totals = this.cartService.calculateCartTotals(cart);

    res.json(ApiResponse.success({
      id: cart.id,
      items: cart.items?.map(item => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          images: item.product.images,
        } : null,
        variant: item.variant ? {
          id: item.variant.id,
          sku: item.variant.sku,
          options: item.variant.options,
        } : null,
      })) || [],
      ...totals,
    }, 'Item removed from cart'));
  };

  clearCart = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string | undefined;

    await this.cartService.clearCart(tenantId, userId, sessionId);

    res.json(ApiResponse.success({ items: [], subtotal: 0, itemCount: 0 }, 'Cart cleared'));
  };

  mergeCart = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const userId = req.user!.id;
    const sessionId = req.headers['x-session-id'] as string | undefined;

    if (!sessionId) {
      res.json(ApiResponse.success(null, 'No guest cart to merge'));
      return;
    }

    const cart = await this.cartService.mergeGuestCart(tenantId, userId, sessionId);

    if (!cart) {
      res.json(ApiResponse.success({ items: [], subtotal: 0, itemCount: 0 }));
      return;
    }

    const totals = this.cartService.calculateCartTotals(cart);

    res.json(ApiResponse.success({
      id: cart.id,
      items: cart.items?.map(item => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          images: item.product.images,
        } : null,
        variant: item.variant ? {
          id: item.variant.id,
          sku: item.variant.sku,
          options: item.variant.options,
        } : null,
      })) || [],
      ...totals,
    }, 'Cart merged successfully'));
  };
}
