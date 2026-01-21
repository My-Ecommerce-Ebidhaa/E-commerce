'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Plus,
  Building2,
  MoreVertical,
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  owner: string;
  email: string;
  template: string;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  plan: string;
  mrr: number;
  createdAt: string;
  products: number;
  orders: number;
}

const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Fashion Hub',
    subdomain: 'fashionhub',
    owner: 'John Smith',
    email: 'john@fashionhub.com',
    template: 'fashion',
    status: 'active',
    plan: 'Professional',
    mrr: 79,
    createdAt: 'Jan 15, 2024',
    products: 156,
    orders: 342,
  },
  {
    id: '2',
    name: 'Auto Masters',
    subdomain: 'automasters',
    owner: 'Mike Johnson',
    email: 'mike@automasters.com',
    template: 'auto',
    status: 'trial',
    plan: 'Free Trial',
    mrr: 0,
    createdAt: 'Feb 20, 2024',
    products: 45,
    orders: 12,
  },
  {
    id: '3',
    name: 'Tech Store',
    subdomain: 'techstore',
    owner: 'Sarah Davis',
    email: 'sarah@techstore.com',
    template: 'electronics',
    status: 'active',
    plan: 'Starter',
    mrr: 29,
    createdAt: 'Dec 10, 2023',
    products: 89,
    orders: 567,
  },
  {
    id: '4',
    name: 'Gadget World',
    subdomain: 'gadgetworld',
    owner: 'Alice Brown',
    email: 'alice@gadgetworld.com',
    template: 'electronics',
    status: 'suspended',
    plan: 'Professional',
    mrr: 0,
    createdAt: 'Nov 5, 2023',
    products: 234,
    orders: 890,
  },
];

const statusConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  active: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-700',
    bg: 'bg-green-100',
  },
  trial: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
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

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTenants = mockTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500">
            Manage all stores on the platform
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or subdomain..."
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
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

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
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                MRR
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">
                        {tenant.subdomain}.ebidhaa.com
                      </div>
                      <div className="text-xs text-gray-400">{tenant.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusConfig[tenant.status].bg
                    } ${statusConfig[tenant.status].color}`}
                  >
                    {statusConfig[tenant.status].icon}
                    {tenant.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{tenant.plan}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {tenant.template} template
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {tenant.products} products
                  </div>
                  <div className="text-xs text-gray-500">
                    {tenant.orders} orders
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    ${tenant.mrr}/mo
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/platform/tenants/${tenant.id}`}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-yellow-600">
                      <Ban className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Create New Tenant</h2>
            <p className="mt-1 text-sm text-gray-500">
              Set up a new store on the platform
            </p>

            <form className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <input
                  type="text"
                  placeholder="My Awesome Store"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subdomain
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    placeholder="mystore"
                    className="block w-full rounded-l-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="inline-flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    .ebidhaa.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Template Type
                </label>
                <select className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select a template</option>
                  <option value="fashion">Fashion</option>
                  <option value="auto">Auto Dealership</option>
                  <option value="electronics">Electronics</option>
                  <option value="general">General Store</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Owner Email
                </label>
                <input
                  type="email"
                  placeholder="owner@store.com"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subscription Plan
                </label>
                <select className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="free">Free (14-day trial)</option>
                  <option value="starter">Starter ($29/mo)</option>
                  <option value="professional">Professional ($79/mo)</option>
                  <option value="enterprise">Enterprise ($299/mo)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Create Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
