'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Building2,
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useTenants, useDeleteTenant, useUpdateTenant } from '@/lib/hooks/use-platform';
import type { Tenant } from '@/lib/api/platform';

const statusConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  active: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-700',
    bg: 'bg-green-100',
  },
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
  },
  suspended: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-red-700',
    bg: 'bg-red-100',
  },
  cancelled: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-gray-700',
    bg: 'bg-gray-100',
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="rounded-lg border bg-white p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useTenants({
    page,
    limit: 10,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const deleteTenant = useDeleteTenant();
  const updateTenant = useUpdateTenant();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      deleteTenant.mutate(id);
    }
  };

  const handleSuspend = async (tenant: Tenant) => {
    const newStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
    if (confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} this tenant?`)) {
      updateTenant.mutate({ id: tenant.id, data: { status: newStatus } });
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const tenants = data?.tenants || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500">
            Manage all stores on the platform ({data?.total || 0} total)
          </p>
        </div>
        <Link
          href="/platform/tenants/new"
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create Tenant
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or subdomain..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Failed to load tenants. Please try again later.
          </p>
        </div>
      )}

      {/* Tenants Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tenant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No tenants match your filters'
                    : 'No tenants found. Create your first tenant to get started.'}
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">
                          {tenant.slug}.ebidhaa.com
                        </div>
                        {tenant.domain && (
                          <div className="text-xs text-gray-400">{tenant.domain}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusConfig[tenant.status]?.bg || 'bg-gray-100'
                      } ${statusConfig[tenant.status]?.color || 'text-gray-700'}`}
                    >
                      {statusConfig[tenant.status]?.icon || <AlertCircle className="h-4 w-4" />}
                      {tenant.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {tenant.plan || 'No plan'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {formatDate(tenant.createdAt)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/platform/tenants/${tenant.id}`}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleSuspend(tenant)}
                        className={`rounded p-1.5 text-gray-400 hover:bg-gray-100 ${
                          tenant.status === 'suspended'
                            ? 'hover:text-green-600'
                            : 'hover:text-yellow-600'
                        }`}
                        title={tenant.status === 'suspended' ? 'Activate' : 'Suspend'}
                        disabled={updateTenant.isPending}
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant.id)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                        title="Delete"
                        disabled={deleteTenant.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
