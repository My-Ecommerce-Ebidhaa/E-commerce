import { apiClient, type ApiResponse } from './client';

export interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ShippingRate {
  method: string;
  name: string;
  price: number;
  estimatedDays: number;
}

export interface CheckoutSession {
  orderId: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  clientSecret: string;
}

export interface InitiateCheckoutRequest {
  shippingAddress: Address;
  billingAddress?: Address;
  sameAsShipping: boolean;
  shippingMethod: 'standard' | 'express' | 'overnight';
  discountCode?: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: string;
  items: Array<{
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productSnapshot: {
      name: string;
      sku: string;
      images: string[];
    };
  }>;
  createdAt: string;
}

export async function calculateShipping(
  tenantSlug: string,
  postalCode: string,
  country: string,
  sessionId?: string
): Promise<ShippingRate[]> {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.post<ApiResponse<ShippingRate[]>>(
    '/checkout/shipping',
    { postalCode, country },
    tenantSlug,
    { headers }
  );
  return response.data.data;
}

export async function validateDiscount(
  tenantSlug: string,
  code: string,
  subtotal: number,
  sessionId?: string
): Promise<{ valid: boolean; discount: number; message?: string }> {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.post<
    ApiResponse<{ valid: boolean; discount: number; message?: string }>
  >(
    '/checkout/discount/validate',
    { code, subtotal },
    tenantSlug,
    { headers }
  );
  return response.data.data;
}

export async function initiateCheckout(
  tenantSlug: string,
  data: InitiateCheckoutRequest,
  sessionId?: string,
  idempotencyKey?: string
): Promise<CheckoutSession> {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }
  if (idempotencyKey) {
    headers['idempotency-key'] = idempotencyKey;
  }

  const response = await apiClient.post<ApiResponse<CheckoutSession>>(
    '/checkout',
    data,
    tenantSlug,
    { headers }
  );
  return response.data.data;
}

export async function confirmOrder(
  tenantSlug: string,
  orderId: string,
  paymentIntentId: string,
  sessionId?: string
): Promise<{ orderId: string; orderNumber: string; status: string; total: number }> {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.post<
    ApiResponse<{ orderId: string; orderNumber: string; status: string; total: number }>
  >(
    `/checkout/${orderId}/confirm`,
    { paymentIntentId },
    tenantSlug,
    { headers }
  );
  return response.data.data;
}

export async function cancelCheckout(
  tenantSlug: string,
  orderId: string,
  sessionId?: string
): Promise<void> {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  await apiClient.post(
    `/checkout/${orderId}/cancel`,
    {},
    tenantSlug,
    { headers }
  );
}

export async function getOrder(
  tenantSlug: string,
  orderId: string,
  sessionId?: string
): Promise<OrderSummary | null> {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  try {
    const response = await apiClient.get<ApiResponse<OrderSummary>>(
      `/checkout/orders/${orderId}`,
      tenantSlug,
      { headers }
    );
    return response.data.data;
  } catch (error) {
    return null;
  }
}
