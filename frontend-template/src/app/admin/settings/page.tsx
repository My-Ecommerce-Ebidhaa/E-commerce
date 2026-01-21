'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Globe,
  CreditCard,
  Mail,
  Bell,
  Shield,
  Truck,
  Percent,
  Palette,
  Users,
  ChevronRight,
  Check,
} from 'lucide-react';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'General',
    description: 'Store name, contact info, and address',
    icon: <Store className="h-5 w-5" />,
    href: '/admin/settings/general',
  },
  {
    id: 'domains',
    title: 'Domains',
    description: 'Manage your store domain and URLs',
    icon: <Globe className="h-5 w-5" />,
    href: '/admin/settings/domains',
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Payment gateways and checkout settings',
    icon: <CreditCard className="h-5 w-5" />,
    href: '/admin/settings/payments',
  },
  {
    id: 'shipping',
    title: 'Shipping',
    description: 'Shipping zones, rates, and carriers',
    icon: <Truck className="h-5 w-5" />,
    href: '/admin/settings/shipping',
  },
  {
    id: 'taxes',
    title: 'Taxes',
    description: 'Tax rates and regions',
    icon: <Percent className="h-5 w-5" />,
    href: '/admin/settings/taxes',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Email and SMS notification settings',
    icon: <Bell className="h-5 w-5" />,
    href: '/admin/settings/notifications',
  },
  {
    id: 'providers',
    title: 'Providers',
    description: 'Configure payment, email, and SMS providers',
    icon: <Mail className="h-5 w-5" />,
    href: '/admin/settings/providers',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Theme, colors, and branding',
    icon: <Palette className="h-5 w-5" />,
    href: '/admin/settings/appearance',
  },
  {
    id: 'users',
    title: 'Users & Permissions',
    description: 'Staff accounts and access control',
    icon: <Users className="h-5 w-5" />,
    href: '/admin/settings/users',
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Security settings and two-factor authentication',
    icon: <Shield className="h-5 w-5" />,
    href: '/admin/settings/security',
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'billing'>('general');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your store configuration</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Store Status</p>
              <p className="text-lg font-semibold text-gray-900">Online</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="text-lg font-semibold text-gray-900">Professional</p>
            </div>
            <Link
              href="/admin/settings/billing"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Upgrade
            </Link>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Staff Members</p>
              <p className="text-lg font-semibold text-gray-900">5 / 10</p>
            </div>
            <Link
              href="/admin/settings/users"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Manage
            </Link>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="flex items-center gap-4 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              {section.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{section.title}</h3>
              <p className="text-sm text-gray-500">{section.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export Store Data
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Import Products
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Clear Cache
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            View API Keys
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-4 font-semibold text-red-900">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Put Store in Maintenance Mode</p>
              <p className="text-sm text-gray-500">
                Your store will be temporarily inaccessible to customers
              </p>
            </div>
            <button className="rounded-lg border border-yellow-600 px-4 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-50">
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-red-200 pt-4">
            <div>
              <p className="font-medium text-gray-900">Delete All Data</p>
              <p className="text-sm text-gray-500">
                Permanently delete all products, orders, and customer data
              </p>
            </div>
            <button className="rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
