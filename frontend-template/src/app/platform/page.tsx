'use client';

import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  href: string;
}

const stats: StatCard[] = [
  {
    label: 'Total Tenants',
    value: '156',
    change: '+12 this month',
    icon: <Building2 className="h-6 w-6" />,
    href: '/platform/tenants',
  },
  {
    label: 'Active Subscriptions',
    value: '142',
    change: '91% active rate',
    icon: <CheckCircle className="h-6 w-6" />,
    href: '/platform/subscriptions',
  },
  {
    label: 'Monthly Revenue',
    value: '$12,450',
    change: '+18% from last month',
    icon: <DollarSign className="h-6 w-6" />,
    href: '/platform/subscriptions',
  },
  {
    label: 'Trial Accounts',
    value: '23',
    change: '14 expiring soon',
    icon: <Clock className="h-6 w-6" />,
    href: '/platform/tenants?status=trial',
  },
];

const recentTenants = [
  {
    id: '1',
    name: 'Fashion Hub',
    owner: 'john@fashionhub.com',
    template: 'fashion',
    status: 'active',
    plan: 'Professional',
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    name: 'Auto Masters',
    owner: 'mike@automasters.com',
    template: 'auto',
    status: 'trial',
    plan: 'Free Trial',
    createdAt: '1 day ago',
  },
  {
    id: '3',
    name: 'Tech Store',
    owner: 'sarah@techstore.com',
    template: 'electronics',
    status: 'active',
    plan: 'Starter',
    createdAt: '3 days ago',
  },
  {
    id: '4',
    name: 'Gadget World',
    owner: 'alice@gadgetworld.com',
    template: 'electronics',
    status: 'past_due',
    plan: 'Professional',
    createdAt: '1 week ago',
  },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  trial: 'bg-blue-100 text-blue-800',
  past_due: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const alerts = [
  {
    type: 'warning',
    message: '14 trial accounts expiring within 7 days',
    action: 'View accounts',
    href: '/platform/tenants?status=trial&expiring=true',
  },
  {
    type: 'error',
    message: '3 subscriptions have past due payments',
    action: 'Review payments',
    href: '/platform/subscriptions?status=past_due',
  },
];

export default function PlatformDashboard() {
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
            {recentTenants.map((tenant) => (
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
                    <p className="text-sm text-gray-500">{tenant.owner}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusColors[tenant.status]
                    }`}
                  >
                    {tenant.status}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">{tenant.createdAt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Subscription Distribution */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold text-gray-900">Plan Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { plan: 'Free', count: 23, percentage: 15, color: 'bg-gray-500' },
                { plan: 'Starter', count: 45, percentage: 29, color: 'bg-blue-500' },
                { plan: 'Professional', count: 67, percentage: 43, color: 'bg-indigo-500' },
                { plan: 'Enterprise', count: 21, percentage: 13, color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.plan}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.plan}</span>
                    <span className="text-gray-500">
                      {item.count} tenants ({item.percentage}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/platform/subscriptions"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View subscription details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
