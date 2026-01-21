import { apiClient, type ApiResponse } from './client';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  } | null;
  variant?: {
    id: string;
    sku: string;
    options: Record<string, string>;
  } | null;
}

export interface Cart {
  id?: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export async function fetchCart(
  tenantSlug: string,
  sessionId?: string
): Promise<Cart> {
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.get<Cart>('/cart', { headers });
  return response.data!;
}

export async function addToCart(
  tenantSlug: string,
  data: AddToCartRequest,
  sessionId?: string
): Promise<Cart> {
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.post<Cart>('/cart', data, { headers });
  return response.data!;
}

export async function updateCartItem(
  tenantSlug: string,
  itemId: string,
  data: UpdateCartItemRequest,
  sessionId?: string
): Promise<Cart> {
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.patch<Cart>(
    `/cart/items/${itemId}`,
    data,
    { headers }
  );
  return response.data!;
}

export async function removeFromCart(
  tenantSlug: string,
  itemId: string,
  sessionId?: string
): Promise<Cart> {
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.delete<Cart>(
    `/cart/items/${itemId}`,
    { headers }
  );
  return response.data!;
}

export async function clearCart(
  tenantSlug: string,
  sessionId?: string
): Promise<void> {
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  await apiClient.delete<Cart>('/cart', { headers });
}
