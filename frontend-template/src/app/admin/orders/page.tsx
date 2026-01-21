'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  shippingMethod: string;
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: { name: 'John Smith', email: 'john@example.com' },
    items: 3,
    total: 189.97,
    status: 'processing',
    paymentStatus: 'paid',
    shippingMethod: 'Standard Shipping',
    createdAt: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: { name: 'Sarah Davis', email: 'sarah@example.com' },
    items: 1,
    total: 79.99,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingMethod: 'Express Shipping',
    createdAt: '2024-01-19T14:45:00Z',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: { name: 'Mike Johnson', email: 'mike@example.com' },
    items: 5,
    total: 349.95,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingMethod: 'Standard Shipping',
    createdAt: '2024-01-18T09:15:00Z',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customer: { name: 'Emily Brown', email: 'emily@example.com' },
    items: 2,
    total: 159.98,
    status: 'pending',
    paymentStatus: 'pending',
    shippingMethod: 'Standard Shipping',
    createdAt: '2024-01-20T16:00:00Z',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customer: { name: 'Alex Wilson', email: 'alex@example.com' },
    items: 1,
    total: 29.99,
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingMethod: 'Standard Shipping',
    createdAt: '2024-01-17T11:30:00Z',
  },
];

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
  },
  processing: {
    icon: <Package className="h-4 w-4" />,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  shipped: {
    icon: <Truck className="h-4 w-4" />,
    color: 'text-purple-700',
    bg: 'bg-purple-100',
  },
  delivered: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-700',
    bg: 'bg-green-100',
  },
  cancelled: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-700',
    bg: 'bg-red-100',
  },
  refunded: {
    icon: <RefreshCw className="h-4 w-4" />,
    color: 'text-gray-700',
    bg: 'bg-gray-100',
  },
};

const paymentStatusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate summary stats
  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    processing: mockOrders.filter(o => o.status === 'processing').length,
    shipped: mockOrders.filter(o => o.status === 'shipped').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">Manage and fulfill customer orders</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Processing</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Shipped</p>
          <p className="mt-1 text-2xl font-bold text-purple-600">{stats.shipped}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number, customer name or email..."
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
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-blue-50 px-4 py-3">
          <span className="text-sm font-medium text-blue-700">
            {selectedOrders.length} selected
          </span>
          <div className="flex gap-2">
            <button className="rounded px-3 py-1 text-sm text-blue-700 hover:bg-blue-100">
              Mark as Processing
            </button>
            <button className="rounded px-3 py-1 text-sm text-blue-700 hover:bg-blue-100">
              Mark as Shipped
            </button>
            <button className="rounded px-3 py-1 text-sm text-blue-700 hover:bg-blue-100">
              Print Labels
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedOrders.length === filteredOrders.length &&
                    filteredOrders.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleSelect(order.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-sm text-gray-500">{order.items} items</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                  <p className="text-sm text-gray-500">{order.customer.email}</p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusConfig[order.status].bg
                    } ${statusConfig[order.status].color}`}
                  >
                    {statusConfig[order.status].icon}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      paymentStatusColors[order.paymentStatus]
                    }`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowActionMenu(showActionMenu === order.id ? null : order.id)
                      }
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {showActionMenu === order.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                        {order.status === 'pending' && (
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Package className="h-4 w-4" />
                            Mark Processing
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Truck className="h-4 w-4" />
                            Mark Shipped
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <CheckCircle className="h-4 w-4" />
                            Mark Delivered
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <>
                            <hr className="my-1" />
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                              <XCircle className="h-4 w-4" />
                              Cancel Order
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
            Showing 1 to {filteredOrders.length} of {mockOrders.length} orders
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">1</button>
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">2</button>
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
