'use client';

import {
  Building2,
  DollarSign,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { usePlatformStats, useTenants, useSubscriptions } from '@/lib/hooks/use-platform';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  trial: 'bg-blue-100 text-blue-800',
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-red-100 text-red-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="h-4 w-64 bg-gray-200 rounded mt-2"></div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-6">
            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlatformDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = usePlatformStats();
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({ limit: 4 });
  const { data: subscriptionsData } = useSubscriptions({ status: 'past_due', limit: 10 });

  if (statsLoading) {
    return <LoadingSkeleton />;
  }

  // Calculate stat cards from real data
  const statCards = [
    {
      label: 'Total Tenants',
      value: stats?.totalTenants?.toString() || '0',
      change: `+${stats?.newTenantsThisMonth || 0} this month`,
      icon: <Building2 className="h-6 w-6" />,
      href: '/platform/tenants',
    },
    {
      label: 'Active Subscriptions',
      value: stats?.activeSubscriptions?.toString() || '0',
      change: stats?.totalTenants
        ? `${Math.round((stats.activeTenants / stats.totalTenants) * 100)}% active rate`
        : '0% active rate',
      icon: <CheckCircle className="h-6 w-6" />,
      href: '/platform/subscriptions',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      change: `ARPU: ${formatCurrency(stats?.averageRevenuePerUser || 0)}`,
      icon: <DollarSign className="h-6 w-6" />,
      href: '/platform/subscriptions',
    },
    {
      label: 'Churn Rate',
      value: `${stats?.churnRate?.toFixed(1) || 0}%`,
      change: 'Monthly churn',
      icon: <Clock className="h-6 w-6" />,
      href: '/platform/subscriptions',
    },
  ];

  // Build alerts based on real data
  const alerts = [];
  const pastDueCount = subscriptionsData?.subscriptions?.length || 0;

  if (pastDueCount > 0) {
    alerts.push({
      type: 'error',
      message: `${pastDueCount} subscription${pastDueCount > 1 ? 's have' : ' has'} past due payments`,
      action: 'Review payments',
      href: '/platform/subscriptions?status=past_due',
    });
  }

  const tenants = tenantsData?.tenants || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500">
          Monitor and manage all tenants across the platform
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded-lg p-4 ${
                alert.type === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle
                  className={`h-5 w-5 ${
                    alert.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                  }`}
                />
                <span
                  className={`text-sm ${
                    alert.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                  }`}
                >
                  {alert.message}
                </span>
              </div>
              <Link
                href={alert.href}
                className={`text-sm font-medium ${
                  alert.type === 'error'
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-yellow-600 hover:text-yellow-700'
                }`}
              >
                {alert.action}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {statsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Failed to load platform statistics. Please try again later.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
                {stat.icon}
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tenants */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-gray-900">Recent Tenants</h2>
            <Link
              href="/platform/tenants"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="divide-y">
            {tenantsLoading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded mt-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : tenants.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No tenants found
              </div>
            ) : (
              tenants.map((tenant) => (
                <Link
                  key={tenant.id}
                  href={`/platform/tenants/${tenant.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-500">{tenant.slug}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColors[tenant.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tenant.status}
                    </span>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(tenant.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              href="/platform/tenants/new"
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create New Tenant</p>
                  <p className="text-sm text-gray-500">Set up a new store</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              href="/platform/plans"
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Manage Plans</p>
                  <p className="text-sm text-gray-500">Configure pricing tiers</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              href="/platform/subscriptions"
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Subscriptions</p>
                  <p className="text-sm text-gray-500">Monitor billing status</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
