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
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.get<ApiResponse<Cart>>(
    '/cart',
    tenantSlug,
    { headers }
  );
  return response.data.data;
}

export async function addToCart(
  tenantSlug: string,
  data: AddToCartRequest,
  sessionId?: string
): Promise<Cart> {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.post<ApiResponse<Cart>>(
    '/cart',
    data,
    tenantSlug,
    { headers }
  );
  return response.data.data;
}

export async function updateCartItem(
  tenantSlug: string,
  itemId: string,
  data: UpdateCartItemRequest,
  sessionId?: string
): Promise<Cart> {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.patch<ApiResponse<Cart>>(
    `/cart/items/${itemId}`,
    data,
    tenantSlug,
    { headers }
  );
  return response.data.data;
}

export async function removeFromCart(
  tenantSlug: string,
  itemId: string,
  sessionId?: string
): Promise<Cart> {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.delete<ApiResponse<Cart>>(
    `/cart/items/${itemId}`,
    tenantSlug,
    { headers }
  );
  return response.data.data;
}

export async function clearCart(
  tenantSlug: string,
  sessionId?: string
): Promise<void> {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  await apiClient.delete<ApiResponse<Cart>>(
    '/cart',
    tenantSlug,
    { headers }
  );
}
