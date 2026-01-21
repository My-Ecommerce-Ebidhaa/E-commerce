'use client';

import Link from 'next/link';
import {
  Settings,
  CreditCard,
  Mail,
  ChevronRight,
  Check,
} from 'lucide-react';
import { usePlatformSettings, usePlatformStats } from '@/lib/hooks/use-platform';

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
    description: 'Platform branding and support information',
    icon: <Settings className="h-5 w-5" />,
    href: '/platform/settings/general',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Configure default payment, email, and SMS providers',
    icon: <CreditCard className="h-5 w-5" />,
    href: '/platform/settings/integrations',
  },
];

export default function PlatformSettingsPage() {
  const { data: settings, isLoading: settingsLoading } = usePlatformSettings();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();

  const hasPaymentProvider = !!settings?.defaultPaymentProvider;
  const hasEmailProvider = !!settings?.defaultEmailProvider;
  const hasSmsProvider = !!settings?.defaultSmsProvider;
  const configuredProviders = [hasPaymentProvider, hasEmailProvider, hasSmsProvider].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500">Manage platform-wide configuration and default providers</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Platform Status</p>
              <p className="text-lg font-semibold text-gray-900">Active</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Tenants</p>
              <p className="text-lg font-semibold text-gray-900">
                {statsLoading ? '...' : stats?.activeTenants || 0}
              </p>
            </div>
            <Link
              href="/platform/tenants"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View
            </Link>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Default Providers</p>
              <p className="text-lg font-semibold text-gray-900">{configuredProviders} / 3</p>
            </div>
            <Link
              href="/platform/settings/integrations"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Configure
            </Link>
          </div>
        </div>
      </div>

      {/* Provider Status Overview */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Default Provider Status</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${hasPaymentProvider ? 'bg-green-100' : 'bg-gray-100'}`}>
              <CreditCard className={`h-5 w-5 ${hasPaymentProvider ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Payment</p>
              <p className="text-sm text-gray-500">
                {settingsLoading
                  ? 'Loading...'
                  : hasPaymentProvider
                    ? settings.defaultPaymentProvider
                    : 'Not configured'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${hasEmailProvider ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Mail className={`h-5 w-5 ${hasEmailProvider ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-500">
                {settingsLoading
                  ? 'Loading...'
                  : hasEmailProvider
                    ? settings.defaultEmailProvider
                    : 'Not configured'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${hasSmsProvider ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Mail className={`h-5 w-5 ${hasSmsProvider ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="font-medium text-gray-900">SMS</p>
              <p className="text-sm text-gray-500">
                {settingsLoading
                  ? 'Loading...'
                  : hasSmsProvider
                    ? settings.defaultSmsProvider
                    : 'Not configured'}
              </p>
            </div>
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

      {/* Info Card */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h2 className="mb-2 font-semibold text-blue-900">About Default Providers</h2>
        <p className="text-sm text-blue-800">
          Default providers are used by tenants who choose to use platform defaults instead of
          configuring their own. When a tenant enables &quot;Use Platform Default&quot; for a provider type,
          they will inherit the configuration you set here. This allows you to offer a turnkey
          solution for tenants who don&apos;t want to manage their own provider integrations.
        </p>
      </div>
    </div>
  );
}
