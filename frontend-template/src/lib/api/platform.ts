import { apiClient, type ApiResponse } from './client';

// Types
export interface TenantSettings {
  // Branding
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  gradientColors?: {
    start?: string;
    end?: string;
    direction?: 'to-right' | 'to-bottom' | 'to-bottom-right';
  };
  // Contact
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  supportEmail?: string;
  address?: string;
  // Social links
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  // Regional
  currency?: string;
  timezone?: string;
  // KYC
  kyc?: {
    businessRegistrationNumber?: string;
    taxId?: string;
    businessType?: 'sole_proprietorship' | 'partnership' | 'corporation' | 'llc';
    registeredAddress?: string;
    registeredCountry?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
  };
  // About
  about?: {
    shortDescription?: string;
    longDescription?: string;
    mission?: string;
    vision?: string;
  };
  // Policies
  policies?: {
    returnPolicy?: string;
    shippingPolicy?: string;
    privacyPolicy?: string;
    termsOfService?: string;
  };
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: 'active' | 'suspended' | 'pending';
  plan?: string;
  templateType?: string;
  settings?: TenantSettings;
  useDefaultPaymentProvider?: boolean;
  useDefaultEmailProvider?: boolean;
  useDefaultSmsProvider?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: {
    products?: number;
    orders?: number;
    storage?: number;
    staff?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  tenant?: Tenant;
  planId: string;
  plan?: Plan;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  newTenantsThisMonth: number;
  churnRate: number;
  averageRevenuePerUser: number;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  domain?: string;
  planId?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateTenantRequest {
  name?: string;
  slug?: string;
  domain?: string;
  status?: 'active' | 'suspended' | 'pending';
  settings?: Record<string, unknown>;
}

export interface CreatePlanRequest {
  name: string;
  slug: string;
  description?: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: {
    products?: number;
    orders?: number;
    storage?: number;
    staff?: number;
  };
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  features?: string[];
  limits?: {
    products?: number;
    orders?: number;
    storage?: number;
    staff?: number;
  };
  isActive?: boolean;
}

// Platform Stats
export async function fetchPlatformStats(accessToken?: string): Promise<PlatformStats> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.get<PlatformStats>('/platform/stats');
  return response.data!;
}

// Tenants
export async function fetchTenants(
  accessToken?: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }
): Promise<{ tenants: Tenant[]; total: number; page: number; totalPages: number }> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.get<Tenant[]>('/platform/tenants', { params });
  return {
    tenants: response.data || [],
    total: response.meta?.total || 0,
    page: response.meta?.page || 1,
    totalPages: response.meta?.totalPages || 1,
  };
}

export async function fetchTenant(id: string, accessToken?: string): Promise<Tenant | null> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  try {
    const response = await apiClient.get<Tenant>(`/platform/tenants/${id}`);
    return response.data!;
  } catch (error) {
    return null;
  }
}

export async function createTenant(
  data: CreateTenantRequest,
  accessToken?: string
): Promise<Tenant> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.post<Tenant>('/platform/tenants', data);
  return response.data!;
}

export async function updateTenant(
  id: string,
  data: UpdateTenantRequest,
  accessToken?: string
): Promise<Tenant> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.patch<Tenant>(`/platform/tenants/${id}`, data);
  return response.data!;
}

export async function deleteTenant(id: string, accessToken?: string): Promise<void> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  await apiClient.delete(`/platform/tenants/${id}`);
}

// Plans
export async function fetchPlans(
  accessToken?: string,
  params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }
): Promise<{ plans: Plan[]; total: number }> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.get<Plan[]>('/platform/plans', { params });
  return {
    plans: response.data || [],
    total: response.meta?.total || 0,
  };
}

export async function fetchPlan(id: string, accessToken?: string): Promise<Plan | null> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  try {
    const response = await apiClient.get<Plan>(`/platform/plans/${id}`);
    return response.data!;
  } catch (error) {
    return null;
  }
}

export async function createPlan(
  data: CreatePlanRequest,
  accessToken?: string
): Promise<Plan> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.post<Plan>('/platform/plans', data);
  return response.data!;
}

export async function updatePlan(
  id: string,
  data: UpdatePlanRequest,
  accessToken?: string
): Promise<Plan> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.patch<Plan>(`/platform/plans/${id}`, data);
  return response.data!;
}

export async function deletePlan(id: string, accessToken?: string): Promise<void> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  await apiClient.delete(`/platform/plans/${id}`);
}

// Subscriptions
export async function fetchSubscriptions(
  accessToken?: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    planId?: string;
    tenantId?: string;
  }
): Promise<{ subscriptions: Subscription[]; total: number; page: number; totalPages: number }> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.get<Subscription[]>('/platform/subscriptions', { params });
  return {
    subscriptions: response.data || [],
    total: response.meta?.total || 0,
    page: response.meta?.page || 1,
    totalPages: response.meta?.totalPages || 1,
  };
}

export async function fetchSubscription(
  id: string,
  accessToken?: string
): Promise<Subscription | null> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  try {
    const response = await apiClient.get<Subscription>(`/platform/subscriptions/${id}`);
    return response.data!;
  } catch (error) {
    return null;
  }
}

export async function cancelSubscription(
  id: string,
  accessToken?: string
): Promise<Subscription> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.post<Subscription>(`/platform/subscriptions/${id}/cancel`);
  return response.data!;
}

// Platform Settings Types
export interface PlatformSettings {
  id: string;
  defaultPaymentProvider?: string;
  defaultPaymentSettings?: Record<string, unknown>;
  defaultEmailProvider?: string;
  defaultEmailSettings?: Record<string, unknown>;
  defaultSmsProvider?: string;
  defaultSmsSettings?: Record<string, unknown>;
  defaultBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  supportEmail?: string;
  supportPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigureProviderRequest {
  provider: string;
  credentials: Record<string, string>;
  settings?: Record<string, unknown>;
}

export interface UpdatePlatformSettingsRequest {
  defaultBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  supportEmail?: string;
  supportPhone?: string;
}

export interface ProviderStatus {
  configured: boolean;
  provider?: string;
  status?: 'active' | 'error' | 'unconfigured';
}

export interface SupportedProviders {
  payment: string[];
  email: string[];
  sms: string[];
}

export interface TenantProviderStatus {
  payment: {
    useDefault: boolean;
    hasOwn: boolean;
    defaultAvailable: boolean;
  };
  email: {
    useDefault: boolean;
    hasOwn: boolean;
    defaultAvailable: boolean;
  };
  sms: {
    useDefault: boolean;
    hasOwn: boolean;
    defaultAvailable: boolean;
  };
}

export interface CreateTenantFullRequest {
  name: string;
  slug: string;
  domain?: string;
  templateType?: string;
  planId?: string;
  settings?: TenantSettings;
  useDefaultPaymentProvider?: boolean;
  useDefaultEmailProvider?: boolean;
  useDefaultSmsProvider?: boolean;
}

export interface UpdateTenantSettingsRequest {
  settings?: TenantSettings;
  useDefaultPaymentProvider?: boolean;
  useDefaultEmailProvider?: boolean;
  useDefaultSmsProvider?: boolean;
}

// Platform Settings API
export async function fetchPlatformSettings(accessToken?: string): Promise<PlatformSettings> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.get<PlatformSettings>('/platform/settings');
  return response.data!;
}

export async function updatePlatformSettings(
  data: UpdatePlatformSettingsRequest,
  accessToken?: string
): Promise<PlatformSettings> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.patch<PlatformSettings>('/platform/settings', data);
  return response.data!;
}

export async function fetchSupportedProviders(accessToken?: string): Promise<SupportedProviders> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.get<SupportedProviders>('/platform/settings/providers/supported');
  return response.data!;
}

export async function configureDefaultPaymentProvider(
  data: ConfigureProviderRequest,
  accessToken?: string
): Promise<PlatformSettings> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.post<PlatformSettings>('/platform/settings/providers/payment', data);
  return response.data!;
}

export async function configureDefaultEmailProvider(
  data: ConfigureProviderRequest,
  accessToken?: string
): Promise<PlatformSettings> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.post<PlatformSettings>('/platform/settings/providers/email', data);
  return response.data!;
}

export async function configureDefaultSmsProvider(
  data: ConfigureProviderRequest,
  accessToken?: string
): Promise<PlatformSettings> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.post<PlatformSettings>('/platform/settings/providers/sms', data);
  return response.data!;
}

export async function removeDefaultProvider(
  type: 'payment' | 'email' | 'sms',
  accessToken?: string
): Promise<PlatformSettings> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.delete<PlatformSettings>(`/platform/settings/providers/${type}`);
  return response.data!;
}

export async function getProviderStatus(
  type: 'payment' | 'email' | 'sms',
  accessToken?: string
): Promise<ProviderStatus> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.get<ProviderStatus>(`/platform/settings/providers/${type}/status`);
  return response.data!;
}

// Extended Tenant API
export async function createTenantFull(
  data: CreateTenantFullRequest,
  accessToken?: string
): Promise<Tenant> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.post<Tenant>('/platform/tenants', data);
  return response.data!;
}

export async function updateTenantSettings(
  id: string,
  data: UpdateTenantSettingsRequest,
  accessToken?: string
): Promise<Tenant> {
  if (accessToken) {
    apiClient.setAccessToken(accessToken);
  }

  const response = await apiClient.patch<Tenant>(`/platform/tenants/${id}`, data);
  return response.data!;
}
