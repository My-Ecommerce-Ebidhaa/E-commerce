'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Send,
  Printer,
  MoreVertical,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  variant?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingMethod: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    event: string;
    description: string;
    timestamp: string;
  }[];
}

const mockOrder: Order = {
  id: '1',
  orderNumber: 'ORD-2024-001',
  status: 'processing',
  paymentStatus: 'paid',
  paymentMethod: 'Credit Card (**** 4242)',
  customer: {
    id: 'cust-1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
  },
  shippingAddress: {
    line1: '123 Main Street',
    line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
  },
  billingAddress: {
    line1: '123 Main Street',
    line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
  },
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      name: 'Classic White T-Shirt',
      sku: 'TSH-WHT-001',
      variant: 'Medium',
      price: 29.99,
      quantity: 2,
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      name: 'Slim Fit Jeans',
      sku: 'JNS-BLU-002',
      variant: '32x32',
      price: 79.99,
      quantity: 1,
    },
    {
      id: 'item-3',
      productId: 'prod-3',
      name: 'Leather Belt',
      sku: 'BLT-BRN-001',
      price: 49.99,
      quantity: 1,
    },
  ],
  subtotal: 189.96,
  shipping: 9.99,
  tax: 16.50,
  discount: 10.00,
  total: 206.45,
  shippingMethod: 'Standard Shipping (5-7 business days)',
  notes: 'Please leave package at the door if no one is home.',
  createdAt: '2024-01-20T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
  timeline: [
    {
      event: 'Order Placed',
      description: 'Customer placed order',
      timestamp: '2024-01-20T10:30:00Z',
    },
    {
      event: 'Payment Received',
      description: 'Payment of $206.45 via Credit Card',
      timestamp: '2024-01-20T10:31:00Z',
    },
    {
      event: 'Order Confirmed',
      description: 'Order confirmed and sent for processing',
      timestamp: '2024-01-20T10:35:00Z',
    },
    {
      event: 'Processing',
      description: 'Order is being prepared',
      timestamp: '2024-01-20T14:45:00Z',
    },
  ],
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  pending: {
    icon: <Clock className="h-5 w-5" />,
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    label: 'Pending',
  },
  processing: {
    icon: <Package className="h-5 w-5" />,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    label: 'Processing',
  },
  shipped: {
    icon: <Truck className="h-5 w-5" />,
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    label: 'Shipped',
  },
  delivered: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-green-700',
    bg: 'bg-green-100',
    label: 'Delivered',
  },
  cancelled: {
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-red-700',
    bg: 'bg-red-100',
    label: 'Cancelled',
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order] = useState<Order>(mockOrder);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: Order['shippingAddress']) => {
    return `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  };

  const handleUpdateStatus = (newStatus: string) => {
    // TODO: Implement API call
    console.log('Update status to:', newStatus);
    setShowStatusModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                  statusConfig[order.status].bg
                } ${statusConfig[order.status].color}`}
              >
                {statusConfig[order.status].icon}
                {statusConfig[order.status].label}
              </span>
            </div>
            <p className="text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
                  <Printer className="h-4 w-4" />
                  Print Order
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <FileText className="h-4 w-4" />
                  Print Invoice
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Send className="h-4 w-4" />
                  Resend Confirmation
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <RefreshCw className="h-4 w-4" />
                  Issue Refund
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowStatusModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="rounded-lg border bg-white">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/admin/products/${item.productId}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      SKU: {item.sku} {item.variant && `• ${item.variant}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-base font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {order.status === 'processing' && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Shipping Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Truck className="h-4 w-4" />
                  Mark as Shipped
                </button>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Order Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {order.timeline.map((event, index) => (
                  <div key={index} className="relative flex gap-4 pl-10">
                    <div className="absolute left-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.event}</p>
                      <p className="text-sm text-gray-500">{event.description}</p>
                      <p className="mt-1 text-xs text-gray-400">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Customer</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                  <Link
                    href={`/admin/customers/${order.customer.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View profile
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {order.customer.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {order.customer.phone}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Shipping Address</h2>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">
                {formatAddress(order.shippingAddress)}
              </p>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              <strong>Method:</strong> {order.shippingMethod}
            </p>
            {order.trackingNumber && (
              <p className="mt-1 text-sm text-gray-500">
                <strong>Tracking:</strong> {order.trackingNumber}
              </p>
            )}
          </div>

          {/* Payment */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Payment</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{order.paymentMethod}</span>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : order.paymentStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Order Notes</h2>
              <div className="flex gap-2 rounded-lg bg-yellow-50 p-3">
                <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Update Order Status</h2>
            <p className="mt-1 text-sm text-gray-500">
              Select the new status for this order
            </p>
            <div className="mt-4 space-y-2">
              {Object.entries(statusConfig).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-gray-50 ${
                    order.status === status ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <span className={`${config.color}`}>{config.icon}</span>
                  <span className="font-medium text-gray-900">{config.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Issue Refund</h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the amount to refund for this order
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Refund Amount
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  defaultValue={order.total}
                  step="0.01"
                  min="0"
                  max={order.total}
                  className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Maximum refundable: ${order.total.toFixed(2)}
              </p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Reason (optional)
              </label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter reason for refund..."
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Issue Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
