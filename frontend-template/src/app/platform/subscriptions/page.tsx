'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
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
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react';

interface Subscription {
  id: string;
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
  plan: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  cancelledAt?: string;
}

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    tenant: { id: '1', name: 'Fashion Hub', subdomain: 'fashionhub' },
    plan: 'Professional',
    price: 79,
    billingCycle: 'monthly',
    status: 'active',
    currentPeriodStart: '2024-01-15',
    currentPeriodEnd: '2024-02-15',
  },
  {
    id: 'sub-2',
    tenant: { id: '2', name: 'Auto Masters', subdomain: 'automasters' },
    plan: 'Free Trial',
    price: 0,
    billingCycle: 'monthly',
    status: 'trialing',
    currentPeriodStart: '2024-01-20',
    currentPeriodEnd: '2024-02-03',
    trialEndsAt: '2024-02-03',
  },
  {
    id: 'sub-3',
    tenant: { id: '3', name: 'Tech Store', subdomain: 'techstore' },
    plan: 'Starter',
    price: 29,
    billingCycle: 'monthly',
    status: 'active',
    currentPeriodStart: '2024-01-10',
    currentPeriodEnd: '2024-02-10',
  },
  {
    id: 'sub-4',
    tenant: { id: '4', name: 'Gadget World', subdomain: 'gadgetworld' },
    plan: 'Professional',
    price: 79,
    billingCycle: 'monthly',
    status: 'past_due',
    currentPeriodStart: '2024-01-05',
    currentPeriodEnd: '2024-02-05',
  },
  {
    id: 'sub-5',
    tenant: { id: '5', name: 'Style Boutique', subdomain: 'styleboutique' },
    plan: 'Enterprise',
    price: 299,
    billingCycle: 'yearly',
    status: 'active',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2025-01-01',
  },
  {
    id: 'sub-6',
    tenant: { id: '6', name: 'Home Decor Co', subdomain: 'homedecor' },
    plan: 'Starter',
    price: 29,
    billingCycle: 'monthly',
    status: 'cancelled',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2024-01-15',
    cancelledAt: '2024-01-10',
  },
];

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

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const filteredSubscriptions = mockSubscriptions.filter((sub) => {
    const matchesSearch =
      sub.tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate summary stats
  const stats = {
    mrr: mockSubscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.price : s.price / 12), 0),
    activeCount: mockSubscriptions.filter(s => s.status === 'active').length,
    trialingCount: mockSubscriptions.filter(s => s.status === 'trialing').length,
    pastDueCount: mockSubscriptions.filter(s => s.status === 'past_due').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-500">Manage all tenant subscriptions</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-xl font-bold text-gray-900">${stats.mrr.toFixed(2)}</p>
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
              <p className="text-xl font-bold text-gray-900">{stats.activeCount}</p>
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
              <p className="text-xl font-bold text-gray-900">{stats.trialingCount}</p>
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
              <p className="text-xl font-bold text-gray-900">{stats.pastDueCount}</p>
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
            placeholder="Search by tenant name or subdomain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trialing">Trial</option>
          <option value="past_due">Past Due</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Plans</option>
          <option value="Free Trial">Free Trial</option>
          <option value="Starter">Starter</option>
          <option value="Professional">Professional</option>
          <option value="Enterprise">Enterprise</option>
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
                Price
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
            {filteredSubscriptions.map((subscription) => (
              <tr key={subscription.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <Link
                    href={`/platform/tenants/${subscription.tenant.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {subscription.tenant.name}
                  </Link>
                  <p className="text-sm text-gray-500">{subscription.tenant.subdomain}.ebidhaa.com</p>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-medium text-gray-900">{subscription.plan}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusConfig[subscription.status].bg
                    } ${statusConfig[subscription.status].color}`}
                  >
                    {statusConfig[subscription.status].icon}
                    {statusConfig[subscription.status].label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-medium text-gray-900">
                    ${subscription.price}
                  </span>
                  <span className="text-gray-500">
                    /{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </div>
                  {subscription.trialEndsAt && (
                    <p className="text-xs text-blue-600">
                      Trial ends {formatDate(subscription.trialEndsAt)}
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
                          href={`/platform/tenants/${subscription.tenant.id}`}
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
                        {subscription.status !== 'cancelled' && (
                          <>
                            <hr className="my-1" />
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
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
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-sm text-gray-500">
            Showing 1 to {filteredSubscriptions.length} of {mockSubscriptions.length} subscriptions
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded bg-slate-900 px-3 py-1 text-sm text-white">1</button>
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
