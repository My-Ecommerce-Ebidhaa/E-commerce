'use client';

import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';

interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  href: string;
}

const stats: StatCard[] = [
  {
    label: 'Total Revenue',
    value: '$45,231.89',
    change: 20.1,
    icon: <DollarSign className="h-6 w-6" />,
    href: '/admin/analytics',
  },
  {
    label: 'Orders',
    value: '356',
    change: 15.2,
    icon: <ShoppingCart className="h-6 w-6" />,
    href: '/admin/orders',
  },
  {
    label: 'Products',
    value: '1,234',
    change: 5.3,
    icon: <Package className="h-6 w-6" />,
    href: '/admin/products',
  },
  {
    label: 'Customers',
    value: '2,350',
    change: -2.4,
    icon: <Users className="h-6 w-6" />,
    href: '/admin/customers',
  },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'John Doe', amount: '$125.00', status: 'Completed' },
  { id: 'ORD-002', customer: 'Jane Smith', amount: '$89.50', status: 'Processing' },
  { id: 'ORD-003', customer: 'Bob Johnson', amount: '$245.00', status: 'Pending' },
  { id: 'ORD-004', customer: 'Alice Brown', amount: '$67.00', status: 'Completed' },
  { id: 'ORD-005', customer: 'Charlie Wilson', amount: '$189.00', status: 'Shipped' },
];

const statusColors: Record<string, string> = {
  Completed: 'bg-green-100 text-green-800',
  Processing: 'bg-blue-100 text-blue-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                {stat.icon}
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{order.amount}</p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 p-4 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              <Package className="h-8 w-8" />
              <div>
                <p className="font-medium">Add Product</p>
                <p className="text-xs text-gray-500">Create a new product</p>
              </div>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 p-4 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              <TrendingUp className="h-8 w-8" />
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-xs text-gray-500">Check store performance</p>
              </div>
            </Link>
            <Link
              href="/admin/staff"
              className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 p-4 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              <Users className="h-8 w-8" />
              <div>
                <p className="font-medium">Invite Staff</p>
                <p className="text-xs text-gray-500">Add team members</p>
              </div>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 p-4 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              <ShoppingCart className="h-8 w-8" />
              <div>
                <p className="font-medium">Store Settings</p>
                <p className="text-xs text-gray-500">Configure your store</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
