'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  MoreVertical,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { useSubscriptions, useCancelSubscription } from '@/lib/hooks/use-platform';

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  active: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-700',
    bg: 'bg-green-100',
    label: 'Active',
  },
  trialing: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    label: 'Trial',
  },
  past_due: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-red-700',
    bg: 'bg-red-100',
    label: 'Past Due',
  },
  cancelled: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    label: 'Cancelled',
  },
};

function formatDate(dateString: string) {
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
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-56 bg-gray-200 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="rounded-lg border bg-white p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
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

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const { data, isLoading, error } = useSubscriptions({
    page,
    limit: 10,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const cancelSubscription = useCancelSubscription();

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      cancelSubscription.mutate(id);
      setShowActionMenu(null);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const subscriptions = data?.subscriptions || [];
  const totalPages = data?.totalPages || 1;

  // Calculate stats from data
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const trialingCount = subscriptions.filter(s => s.status === 'trialing').length;
  const pastDueCount = subscriptions.filter(s => s.status === 'past_due').length;

  // Filter by search locally (API already filters by status)
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (!searchQuery) return true;
    const tenantName = sub.tenant?.name?.toLowerCase() || '';
    const tenantSlug = sub.tenant?.slug?.toLowerCase() || '';
    return tenantName.includes(searchQuery.toLowerCase()) ||
           tenantSlug.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-500">Manage all tenant subscriptions ({data?.total || 0} total)</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Failed to load subscriptions. Please try again later.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{data?.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Trialing</p>
              <p className="text-xl font-bold text-gray-900">{trialingCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Past Due</p>
              <p className="text-xl font-bold text-gray-900">{pastDueCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tenant name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <option value="trialing">Trial</option>
          <option value="past_due">Past Due</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tenant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Period
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No subscriptions match your filters'
                    : 'No subscriptions found'}
                </td>
              </tr>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    {subscription.tenant ? (
                      <>
                        <Link
                          href={`/platform/tenants/${subscription.tenantId}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {subscription.tenant.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {subscription.tenant.slug}.ebidhaa.com
                        </p>
                      </>
                    ) : (
                      <span className="text-gray-500">Unknown tenant</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {subscription.plan?.name || 'No plan'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusConfig[subscription.status]?.bg || 'bg-gray-100'
                      } ${statusConfig[subscription.status]?.color || 'text-gray-700'}`}
                    >
                      {statusConfig[subscription.status]?.icon || <AlertCircle className="h-4 w-4" />}
                      {statusConfig[subscription.status]?.label || subscription.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <p className="text-xs text-orange-600">
                        Cancels at period end
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowActionMenu(showActionMenu === subscription.id ? null : subscription.id)
                        }
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {showActionMenu === subscription.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                          <Link
                            href={`/platform/tenants/${subscription.tenantId}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4" />
                            View Tenant
                          </Link>
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <CreditCard className="h-4 w-4" />
                            View Invoices
                          </button>
                          {subscription.status === 'past_due' && (
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              <RefreshCw className="h-4 w-4" />
                              Retry Payment
                            </button>
                          )}
                          {subscription.status !== 'cancelled' && !subscription.cancelAtPeriodEnd && (
                            <>
                              <hr className="my-1" />
                              <button
                                onClick={() => handleCancel(subscription.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                disabled={cancelSubscription.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel Subscription
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="rounded bg-slate-900 px-3 py-1 text-sm text-white">{page}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
