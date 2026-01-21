'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TenantForm } from '@/components/platform/forms/tenant-form';
import { useCreateTenantFull } from '@/lib/hooks/use-platform';
import type { CreateTenantFullRequest } from '@/lib/api/platform';

export default function NewTenantPage() {
  const router = useRouter();
  const createTenant = useCreateTenantFull();

  const handleSubmit = async (data: CreateTenantFullRequest) => {
    try {
      const tenant = await createTenant.mutateAsync(data);
      router.push(`/platform/tenants/${tenant.id}`);
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/platform/tenants"
          className="rounded-lg border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Tenant</h1>
          <p className="text-gray-500">Set up a new business on the platform</p>
        </div>
      </div>

      {/* Form */}
      <TenantForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createTenant.isPending}
      />

      {/* Error Display */}
      {createTenant.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Failed to create tenant. Please check your input and try again.
          </p>
        </div>
      )}
    </div>
  );
}
