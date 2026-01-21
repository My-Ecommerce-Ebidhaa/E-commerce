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
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.post<ShippingRate[]>(
    '/checkout/shipping',
    { postalCode, country },
    { headers }
  );
  return response.data!;
}

export async function validateDiscount(
  tenantSlug: string,
  code: string,
  subtotal: number,
  sessionId?: string
): Promise<{ valid: boolean; discount: number; message?: string }> {
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.post<{ valid: boolean; discount: number; message?: string }>(
    '/checkout/discount/validate',
    { code, subtotal },
    { headers }
  );
  return response.data!;
}

export async function initiateCheckout(
  tenantSlug: string,
  data: InitiateCheckoutRequest,
  sessionId?: string,
  idempotencyKey?: string
): Promise<CheckoutSession> {
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }
  if (idempotencyKey) {
    headers['idempotency-key'] = idempotencyKey;
  }

  const response = await apiClient.post<CheckoutSession>(
    '/checkout',
    data,
    { headers }
  );
  return response.data!;
}

export async function confirmOrder(
  tenantSlug: string,
  orderId: string,
  paymentIntentId: string,
  sessionId?: string
): Promise<{ orderId: string; orderNumber: string; status: string; total: number }> {
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await apiClient.post<{ orderId: string; orderNumber: string; status: string; total: number }>(
    `/checkout/${orderId}/confirm`,
    { paymentIntentId },
    { headers }
  );
  return response.data!;
}

export async function cancelCheckout(
  tenantSlug: string,
  orderId: string,
  sessionId?: string
): Promise<void> {
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  await apiClient.post(
    `/checkout/${orderId}/cancel`,
    {},
    { headers }
  );
}

export async function getOrder(
  tenantSlug: string,
  orderId: string,
  sessionId?: string
): Promise<OrderSummary | null> {
  apiClient.setTenant(tenantSlug);

  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  try {
    const response = await apiClient.get<OrderSummary>(
      `/checkout/orders/${orderId}`,
      { headers }
    );
    return response.data!;
  } catch (error) {
    return null;
  }
}
