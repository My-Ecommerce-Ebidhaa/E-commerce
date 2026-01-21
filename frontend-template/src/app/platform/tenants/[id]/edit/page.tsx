'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { TenantForm } from '@/components/platform/forms/tenant-form';
import { useTenant, useUpdateTenantSettings } from '@/lib/hooks/use-platform';
import type { CreateTenantFullRequest } from '@/lib/api/platform';

export default function EditTenantPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const { data: tenant, isLoading } = useTenant(tenantId);
  const updateTenant = useUpdateTenantSettings();

  const handleSubmit = async (data: CreateTenantFullRequest) => {
    try {
      await updateTenant.mutateAsync({
        id: tenantId,
        data: {
          settings: data.settings,
          useDefaultPaymentProvider: data.useDefaultPaymentProvider,
          useDefaultEmailProvider: data.useDefaultEmailProvider,
          useDefaultSmsProvider: data.useDefaultSmsProvider,
        },
      });
      router.push(`/platform/tenants/${tenantId}`);
    } catch (error) {
      console.error('Failed to update tenant:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/platform/tenants"
            className="rounded-lg border p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenant Not Found</h1>
            <p className="text-gray-500">The requested tenant could not be found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/platform/tenants/${tenantId}`}
          className="rounded-lg border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Tenant</h1>
          <p className="text-gray-500">{tenant.name}</p>
        </div>
      </div>

      {/* Form */}
      <TenantForm
        mode="edit"
        initialData={{
          name: tenant.name,
          slug: tenant.slug,
          domain: tenant.domain,
          templateType: tenant.templateType,
          settings: tenant.settings,
          useDefaultPaymentProvider: tenant.useDefaultPaymentProvider,
          useDefaultEmailProvider: tenant.useDefaultEmailProvider,
          useDefaultSmsProvider: tenant.useDefaultSmsProvider,
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateTenant.isPending}
      />

      {/* Error Display */}
      {updateTenant.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Failed to update tenant. Please check your input and try again.
          </p>
        </div>
      )}
    </div>
  );
}
