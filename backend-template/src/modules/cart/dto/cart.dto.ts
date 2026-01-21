import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export const removeFromCartSchema = z.object({
  itemId: z.string().uuid(),
});

export type AddToCartDto = z.infer<typeof addToCartSchema>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartDto = z.infer<typeof removeFromCartSchema>;
