'use client';

import { useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

interface MetricCard {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

interface ChartData {
  label: string;
  value: number;
}

const metrics: MetricCard[] = [
  {
    label: 'Total Revenue',
    value: '$45,231.89',
    change: 20.1,
    trend: 'up',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    label: 'Orders',
    value: '356',
    change: 12.5,
    trend: 'up',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    label: 'Customers',
    value: '2,350',
    change: 8.2,
    trend: 'up',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Products Sold',
    value: '1,247',
    change: -3.1,
    trend: 'down',
    icon: <Package className="h-5 w-5" />,
  },
];

const revenueData: ChartData[] = [
  { label: 'Jan', value: 12500 },
  { label: 'Feb', value: 15800 },
  { label: 'Mar', value: 14200 },
  { label: 'Apr', value: 18900 },
  { label: 'May', value: 22100 },
  { label: 'Jun', value: 19500 },
  { label: 'Jul', value: 24800 },
  { label: 'Aug', value: 28200 },
  { label: 'Sep', value: 31500 },
  { label: 'Oct', value: 29800 },
  { label: 'Nov', value: 35200 },
  { label: 'Dec', value: 45231 },
];

const categoryData = [
  { name: 'Clothing', value: 35, color: 'bg-blue-500' },
  { name: 'Shoes', value: 25, color: 'bg-green-500' },
  { name: 'Accessories', value: 20, color: 'bg-yellow-500' },
  { name: 'Electronics', value: 12, color: 'bg-purple-500' },
  { name: 'Other', value: 8, color: 'bg-gray-500' },
];

const topProducts = [
  { name: 'Classic White T-Shirt', sales: 245, revenue: 7347.55, change: 12.5 },
  { name: 'Slim Fit Jeans', sales: 189, revenue: 15111.11, change: 8.3 },
  { name: 'Leather Jacket', sales: 156, revenue: 31199.44, change: -2.1 },
  { name: 'Running Sneakers', sales: 134, revenue: 17418.66, change: 15.7 },
  { name: 'Summer Dress', sales: 112, revenue: 6718.88, change: 4.2 },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'John Smith', total: 189.97, status: 'completed' },
  { id: 'ORD-002', customer: 'Sarah Davis', total: 79.99, status: 'processing' },
  { id: 'ORD-003', customer: 'Mike Johnson', total: 349.95, status: 'completed' },
  { id: 'ORD-004', customer: 'Emily Brown', total: 159.98, status: 'pending' },
  { id: 'ORD-005', customer: 'Alex Wilson', total: 29.99, status: 'cancelled' },
];

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');

  const maxRevenue = Math.max(...revenueData.map(d => d.value));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Track your store performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2 ${
                metric.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {metric.icon}
              </div>
              <span
                className={`flex items-center text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {Math.abs(metric.change)}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-sm text-gray-500">Monthly revenue for the year</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
                Revenue
              </button>
              <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100">
                Orders
              </button>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-64">
            {revenueData.map((data) => (
              <div key={data.label} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${(data.value / maxRevenue) * 100}%` }}
                />
                <span className="mt-2 text-xs text-gray-500">{data.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Sales by Category</h2>
          <p className="text-sm text-gray-500 mb-6">Distribution of sales</p>

          <div className="space-y-4">
            {categoryData.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{category.name}</span>
                  <span className="font-medium text-gray-900">{category.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full ${category.color}`}
                    style={{ width: `${category.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Sales</span>
              <span className="font-semibold text-gray-900">$45,231.89</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-gray-900">Top Products</h2>
            <a href="/admin/products" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </a>
          </div>
          <div className="divide-y">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
                  <p
                    className={`text-sm ${
                      product.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {product.change >= 0 ? '+' : ''}{product.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700">
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
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conversion Rate */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">3.24%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Visitors</span>
              <span className="font-medium text-gray-900">10,982</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Converted</span>
              <span className="font-medium text-gray-900">356</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900">$127.06</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+8.2% from last month</span>
            </div>
          </div>
        </div>

        {/* Customer Retention */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Return Customers</p>
              <p className="text-2xl font-bold text-gray-900">42%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">New</span>
              <span className="font-medium text-gray-900">58%</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Returning</span>
              <span className="font-medium text-gray-900">42%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
