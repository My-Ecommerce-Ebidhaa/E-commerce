// Tenant
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  customDomain?: string;
  templateType: 'AUTO_DEALERSHIP' | 'FASHION' | 'ELECTRONICS' | 'GROCERY' | 'GENERAL';
  settings: TenantSettings;
  status: 'active' | 'suspended' | 'trial';
}

export interface TenantSettings {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  currency?: string;
  timezone?: string;
}

// User
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'customer' | 'admin' | 'super_admin';
  emailVerified: boolean;
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
}

// Product
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  status: 'draft' | 'active' | 'archived';
  price: number;
  compareAtPrice?: number;
  sku?: string;
  trackInventory: boolean;
  quantity: number;
  attributes: ProductAttributes;
  category?: Category;
  variants?: ProductVariant[];
  media?: ProductMedia[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributes {
  // Auto
  year?: number;
  make?: string;
  model?: string;
  mileage?: number;
  vin?: string;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  exteriorColor?: string;
  interiorColor?: string;
  condition?: string;
  features?: string[];

  // Fashion
  brand?: string;
  material?: string;
  fit?: string;
  gender?: string;
  season?: string[];

  // Electronics
  warranty?: string;
  specifications?: Record<string, string>;

  [key: string]: unknown;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  quantity: number;
  options: Record<string, string>;
}

export interface ProductMedia {
  id: string;
  type: 'image' | 'video' | 'model_3d';
  url: string;
  altText?: string;
  position: number;
}

// Cart
export interface Cart {
  id: string;
  items: CartItem[];
  discountCode?: string;
  discountAmount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

// Order
export interface Order {
  id: string;
  orderNumber: string;
  email: string;
  phone?: string;
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'partially_refunded' | 'refunded' | 'failed';
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled';
  paymentMethod?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
