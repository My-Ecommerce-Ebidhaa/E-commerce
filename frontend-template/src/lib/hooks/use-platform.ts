'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  fetchPlatformStats,
  fetchTenants,
  fetchTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  fetchPlans,
  fetchPlan,
  createPlan,
  updatePlan,
  deletePlan,
  fetchSubscriptions,
  fetchSubscription,
  cancelSubscription,
  fetchPlatformSettings,
  updatePlatformSettings,
  fetchSupportedProviders,
  configureDefaultPaymentProvider,
  configureDefaultEmailProvider,
  configureDefaultSmsProvider,
  removeDefaultProvider,
  getProviderStatus,
  createTenantFull,
  updateTenantSettings,
  type Tenant,
  type Plan,
  type Subscription,
  type CreateTenantRequest,
  type UpdateTenantRequest,
  type CreatePlanRequest,
  type UpdatePlanRequest,
  type PlatformSettings,
  type UpdatePlatformSettingsRequest,
  type ConfigureProviderRequest,
  type SupportedProviders,
  type ProviderStatus,
  type CreateTenantFullRequest,
  type UpdateTenantSettingsRequest,
} from '@/lib/api/platform';

// Platform Stats
export function usePlatformStats() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['platform', 'stats'],
    queryFn: () => fetchPlatformStats(session?.accessToken),
    enabled: !!session?.accessToken,
  });
}

// Tenants
export function useTenants(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['platform', 'tenants', params],
    queryFn: () => fetchTenants(session?.accessToken, params),
    enabled: !!session?.accessToken,
  });
}

export function useTenant(id: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['platform', 'tenants', id],
    queryFn: () => fetchTenant(id, session?.accessToken),
    enabled: !!session?.accessToken && !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: CreateTenantRequest) =>
      createTenant(data, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'stats'] });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantRequest }) =>
      updateTenant(id, data, session?.accessToken),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants', id] });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (id: string) => deleteTenant(id, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'stats'] });
    },
  });
}

// Plans
export function usePlans(params?: { page?: number; limit?: number; isActive?: boolean }) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['platform', 'plans', params],
    queryFn: () => fetchPlans(session?.accessToken, params),
    enabled: !!session?.accessToken,
  });
}

export function usePlan(id: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['platform', 'plans', id],
    queryFn: () => fetchPlan(id, session?.accessToken),
    enabled: !!session?.accessToken && !!id,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: CreatePlanRequest) => createPlan(data, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'plans'] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) =>
      updatePlan(id, data, session?.accessToken),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'plans', id] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (id: string) => deletePlan(id, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'plans'] });
    },
  });
}

// Subscriptions
export function useSubscriptions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  planId?: string;
  tenantId?: string;
}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['platform', 'subscriptions', params],
    queryFn: () => fetchSubscriptions(session?.accessToken, params),
    enabled: !!session?.accessToken,
  });
}

export function useSubscription(id: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['platform', 'subscriptions', id],
    queryFn: () => fetchSubscription(id, session?.accessToken),
    enabled: !!session?.accessToken && !!id,
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (id: string) => cancelSubscription(id, session?.accessToken),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'subscriptions', id] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'stats'] });
    },
  });
}

// Platform Settings
export function usePlatformSettings() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['platform', 'settings'],
    queryFn: () => fetchPlatformSettings(session?.accessToken),
    enabled: !!session?.accessToken,
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: UpdatePlatformSettingsRequest) =>
      updatePlatformSettings(data, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'settings'] });
    },
  });
}

export function useSupportedProviders() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['platform', 'providers', 'supported'],
    queryFn: () => fetchSupportedProviders(session?.accessToken),
    enabled: !!session?.accessToken,
  });
}

export function useConfigureDefaultPaymentProvider() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: ConfigureProviderRequest) =>
      configureDefaultPaymentProvider(data, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'providers'] });
    },
  });
}

export function useConfigureDefaultEmailProvider() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: ConfigureProviderRequest) =>
      configureDefaultEmailProvider(data, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'providers'] });
    },
  });
}

export function useConfigureDefaultSmsProvider() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: ConfigureProviderRequest) =>
      configureDefaultSmsProvider(data, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'providers'] });
    },
  });
}

export function useRemoveDefaultProvider() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (type: 'payment' | 'email' | 'sms') =>
      removeDefaultProvider(type, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'providers'] });
    },
  });
}

export function useProviderStatus(type: 'payment' | 'email' | 'sms') {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['platform', 'providers', type, 'status'],
    queryFn: () => getProviderStatus(type, session?.accessToken),
    enabled: !!session?.accessToken,
  });
}

// Extended Tenant Hooks
export function useCreateTenantFull() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: CreateTenantFullRequest) =>
      createTenantFull(data, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'stats'] });
    },
  });
}

export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantSettingsRequest }) =>
      updateTenantSettings(id, data, session?.accessToken),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants', id] });
    },
  });
}
