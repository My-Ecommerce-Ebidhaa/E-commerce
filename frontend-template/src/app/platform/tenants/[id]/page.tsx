'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  MoreVertical,
  ExternalLink,
  Ban,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Settings,
  Activity,
  Shield,
} from 'lucide-react';

interface TenantDetail {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  owner: {
    name: string;
    email: string;
    phone?: string;
  };
  template: string;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  subscription: {
    plan: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    status: 'active' | 'past_due' | 'cancelled';
    currentPeriodEnd: string;
    trialEndsAt?: string;
  };
  stats: {
    products: number;
    orders: number;
    customers: number;
    revenue: number;
  };
  createdAt: string;
  lastActiveAt: string;
  settings: {
    currency: string;
    timezone: string;
    language: string;
  };
}

const mockTenant: TenantDetail = {
  id: '1',
  name: 'Fashion Hub',
  subdomain: 'fashionhub',
  customDomain: 'www.fashionhub.com',
  owner: {
    name: 'John Smith',
    email: 'john@fashionhub.com',
    phone: '+1 (555) 123-4567',
  },
  template: 'fashion',
  status: 'active',
  subscription: {
    plan: 'Professional',
    price: 79,
    billingCycle: 'monthly',
    status: 'active',
    currentPeriodEnd: '2024-02-15',
  },
  stats: {
    products: 156,
    orders: 342,
    customers: 1250,
    revenue: 45231.89,
  },
  createdAt: '2024-01-15T10:30:00Z',
  lastActiveAt: '2024-01-20T14:45:00Z',
  settings: {
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'en',
  },
};

const recentOrders = [
  { id: 'ORD-001', customer: 'Sarah D.', total: 189.97, status: 'completed', date: '2 hours ago' },
  { id: 'ORD-002', customer: 'Mike J.', total: 79.99, status: 'processing', date: '5 hours ago' },
  { id: 'ORD-003', customer: 'Emily B.', total: 349.95, status: 'pending', date: '1 day ago' },
];

const activityLog = [
  { action: 'Product added', description: 'Added "Summer Collection Dress"', timestamp: '2 hours ago' },
  { action: 'Order fulfilled', description: 'Order #ORD-342 marked as shipped', timestamp: '5 hours ago' },
  { action: 'Settings updated', description: 'Changed shipping rates', timestamp: '1 day ago' },
  { action: 'Staff added', description: 'Invited team member alice@fashionhub.com', timestamp: '2 days ago' },
];

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  active: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-700', bg: 'bg-green-100' },
  trial: { icon: <Clock className="h-4 w-4" />, color: 'text-blue-700', bg: 'bg-blue-100' },
  suspended: { icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-700', bg: 'bg-red-100' },
  cancelled: { icon: <Ban className="h-4 w-4" />, color: 'text-gray-700', bg: 'bg-gray-100' },
};

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [tenant] = useState<TenantDetail>(mockTenant);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscription' | 'activity' | 'settings'>('overview');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/platform/tenants"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    statusConfig[tenant.status].bg
                  } ${statusConfig[tenant.status].color}`}
                >
                  {statusConfig[tenant.status].icon}
                  {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-500">{tenant.subdomain}.ebidhaa.com</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`https://${tenant.subdomain}.ebidhaa.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            Visit Store
          </a>
          <div className="relative">
            <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showActionMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <RefreshCw className="h-4 w-4" />
                  Reset Password
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Shield className="h-4 w-4" />
                  Login as Admin
                </button>
                <hr className="my-1" />
                {tenant.status !== 'suspended' ? (
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Ban className="h-4 w-4" />
                    Suspend Tenant
                  </button>
                ) : (
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-100">
                    <CheckCircle className="h-4 w-4" />
                    Reactivate Tenant
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'subscription', label: 'Subscription' },
            { id: 'activity', label: 'Activity' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Products</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{tenant.stats.products}</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Orders</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{tenant.stats.orders}</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Customers</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{tenant.stats.customers}</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Revenue</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ${tenant.stats.revenue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="rounded-lg border bg-white">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                  View all
                </a>
              </div>
              <div className="divide-y">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="rounded-lg border bg-white">
              <div className="border-b p-4">
                <h2 className="font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y">
                {activityLog.map((activity, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-gray-100 p-1.5">
                        <Activity className="h-3 w-3 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Owner Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{tenant.owner.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${tenant.owner.email}`} className="text-blue-600 hover:text-blue-700">
                    {tenant.owner.email}
                  </a>
                </div>
                {tenant.owner.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{tenant.owner.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Store Info */}
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Store Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{tenant.subdomain}.ebidhaa.com</span>
                </div>
                {tenant.customDomain && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{tenant.customDomain}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Created {formatDate(tenant.createdAt)}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">Template</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{tenant.template}</p>
                </div>
              </div>
            </div>

            {/* Quick Subscription Info */}
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Subscription</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Plan</span>
                  <span className="font-medium text-gray-900">{tenant.subscription.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Price</span>
                  <span className="font-medium text-gray-900">
                    ${tenant.subscription.price}/{tenant.subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Renews</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(tenant.subscription.currentPeriodEnd)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-6 font-semibold text-gray-900">Subscription Details</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900">{tenant.subscription.plan}</p>
                <p className="text-sm text-gray-500">
                  ${tenant.subscription.price}/{tenant.subscription.billingCycle === 'monthly' ? 'month' : 'year'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-sm font-medium text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Period</p>
                <p className="font-medium text-gray-900">
                  Jan 15, 2024 - {formatDate(tenant.subscription.currentPeriodEnd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Invoice</p>
                <p className="font-medium text-gray-900">
                  ${tenant.subscription.price} on {formatDate(tenant.subscription.currentPeriodEnd)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Change Plan
              </button>
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                View Invoices
              </button>
            </div>
          </div>

          {/* Payment History */}
          <div className="rounded-lg border bg-white">
            <div className="border-b p-4">
              <h2 className="font-semibold text-gray-900">Payment History</h2>
            </div>
            <div className="divide-y">
              {[
                { date: 'Jan 15, 2024', amount: 79, status: 'paid' },
                { date: 'Dec 15, 2023', amount: 79, status: 'paid' },
                { date: 'Nov 15, 2023', amount: 79, status: 'paid' },
              ].map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                    Paid
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="rounded-lg border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold text-gray-900">Activity Log</h2>
          </div>
          <div className="divide-y">
            {[...activityLog, ...activityLog, ...activityLog].map((activity, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-gray-100 p-1.5">
                    <Activity className="h-3 w-3 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Store Settings</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="font-medium text-gray-900">{tenant.settings.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Timezone</p>
                <p className="font-medium text-gray-900">{tenant.settings.timezone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Language</p>
                <p className="font-medium text-gray-900 uppercase">{tenant.settings.language}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div>
                  <p className="font-medium text-gray-900">Suspend Tenant</p>
                  <p className="text-sm text-gray-500">
                    Temporarily disable this tenant's store
                  </p>
                </div>
                <button className="rounded-lg border border-yellow-600 px-4 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-100">
                  Suspend
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                <div>
                  <p className="font-medium text-gray-900">Delete Tenant</p>
                  <p className="text-sm text-gray-500">
                    Permanently delete this tenant and all data
                  </p>
                </div>
                <button className="rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Suspend Tenant</h2>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to suspend "{tenant.name}"? The store will be inaccessible until reactivated.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Reason (optional)</label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter reason for suspension..."
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Suspend Tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
