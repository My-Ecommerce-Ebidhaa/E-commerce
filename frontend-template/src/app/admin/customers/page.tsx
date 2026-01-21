'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  Trash2,
  UserPlus,
  Calendar,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  address?: {
    city: string;
    country: string;
  };
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    totalOrders: 12,
    totalSpent: 1456.78,
    lastOrderDate: '2024-01-20',
    createdAt: '2023-06-15',
    address: { city: 'New York', country: 'USA' },
  },
  {
    id: '2',
    name: 'Sarah Davis',
    email: 'sarah@example.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    totalOrders: 8,
    totalSpent: 892.50,
    lastOrderDate: '2024-01-18',
    createdAt: '2023-08-22',
    address: { city: 'Los Angeles', country: 'USA' },
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    status: 'inactive',
    totalOrders: 2,
    totalSpent: 189.99,
    lastOrderDate: '2023-11-05',
    createdAt: '2023-10-10',
    address: { city: 'Chicago', country: 'USA' },
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily@example.com',
    phone: '+1 (555) 345-6789',
    status: 'active',
    totalOrders: 25,
    totalSpent: 3245.00,
    lastOrderDate: '2024-01-19',
    createdAt: '2023-02-14',
    address: { city: 'Miami', country: 'USA' },
  },
  {
    id: '5',
    name: 'Alex Wilson',
    email: 'alex@example.com',
    status: 'blocked',
    totalOrders: 1,
    totalSpent: 49.99,
    createdAt: '2023-12-01',
    address: { city: 'Seattle', country: 'USA' },
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
  blocked: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate summary stats
  const stats = {
    total: mockCustomers.length,
    active: mockCustomers.filter(c => c.status === 'active').length,
    totalRevenue: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">View and manage your customer base</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Customers</p>
              <p className="text-xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-xl font-bold text-gray-900">${stats.avgOrderValue.toFixed(2)}</p>
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
            placeholder="Search by name or email..."
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
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          More Filters
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-blue-50 px-4 py-3">
          <span className="text-sm font-medium text-blue-700">
            {selectedCustomers.length} selected
          </span>
          <div className="flex gap-2">
            <button className="rounded px-3 py-1 text-sm text-blue-700 hover:bg-blue-100">
              Send Email
            </button>
            <button className="rounded px-3 py-1 text-sm text-blue-700 hover:bg-blue-100">
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedCustomers.length === filteredCustomers.length &&
                    filteredCustomers.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Orders
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Spent
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Last Order
              </th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => toggleSelect(customer.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {customer.name}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </span>
                      </div>
                      {customer.address && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {customer.address.city}, {customer.address.country}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusColors[customer.status].bg
                    } ${statusColors[customer.status].text}`}
                  >
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {customer.totalOrders} orders
                </td>
                <td className="px-4 py-4">
                  <span className="font-medium text-gray-900">
                    ${customer.totalSpent.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowActionMenu(showActionMenu === customer.id ? null : customer.id)
                      }
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {showActionMenu === customer.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                        <Link
                          href={`/admin/orders?customer=${customer.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          View Orders
                        </Link>
                        <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Mail className="h-4 w-4" />
                          Send Email
                        </button>
                        <hr className="my-1" />
                        {customer.status !== 'blocked' ? (
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                            <Ban className="h-4 w-4" />
                            Block Customer
                          </button>
                        ) : (
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-100">
                            <User className="h-4 w-4" />
                            Unblock Customer
                          </button>
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
            Showing 1 to {filteredCustomers.length} of {mockCustomers.length} customers
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">1</button>
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
