import { apiClient, createServerClient, ApiResponse } from './client';
import { Product } from './types';

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  // Template-specific filters
  [key: string]: string | number | undefined;
}

export interface ProductsResponse {
  products: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Client-side functions
export async function getProducts(params: ProductsQueryParams = {}): Promise<ProductsResponse> {
  const response = await apiClient.get<Product[]>('/products', {
    params: params as Record<string, string | number | undefined>,
  });

  return {
    products: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await apiClient.get<{ product: Product }>(`/products/slug/${slug}`);
    return response.data?.product || null;
  } catch {
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await apiClient.get<{ product: Product }>(`/products/${id}`);
    return response.data?.product || null;
  } catch {
    return null;
  }
}

// Server-side functions
export async function fetchProducts(
  tenantSlug: string,
  params: ProductsQueryParams = {}
): Promise<ProductsResponse> {
  const client = createServerClient(tenantSlug);
  const response = await client.get<Product[]>('/products', {
    params: params as Record<string, string | number | undefined>,
  });

  return {
    products: response.data || [],
    meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
}

export async function fetchProductBySlug(
  tenantSlug: string,
  slug: string
): Promise<Product | null> {
  try {
    const client = createServerClient(tenantSlug);
    const response = await client.get<{ product: Product }>(`/products/slug/${slug}`);
    return response.data?.product || null;
  } catch {
    return null;
  }
}
