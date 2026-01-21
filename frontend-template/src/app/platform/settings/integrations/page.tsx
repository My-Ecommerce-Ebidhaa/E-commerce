'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  CreditCard,
  Mail,
  MessageSquare,
  Settings,
  Trash2,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  usePlatformSettings,
  useConfigureDefaultPaymentProvider,
  useConfigureDefaultEmailProvider,
  useConfigureDefaultSmsProvider,
  useRemoveDefaultProvider,
} from '@/lib/hooks/use-platform';
import type { ConfigureProviderRequest } from '@/lib/api/platform';

type ProviderType = 'payment' | 'email' | 'sms';

interface ProviderConfig {
  name: string;
  displayName: string;
  description: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'email';
    placeholder: string;
    required?: boolean;
  }[];
}

const availableProviders: Record<ProviderType, ProviderConfig[]> = {
  payment: [
    {
      name: 'paystack',
      displayName: 'Paystack',
      description: 'Nigerian payment gateway with cards, bank transfers, and USSD',
      fields: [
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...', required: true },
        { key: 'publicKey', label: 'Public Key', type: 'text', placeholder: 'pk_live_...', required: true },
        { key: 'webhookSecret', label: 'Webhook Secret (optional)', type: 'password', placeholder: 'whsec_...' },
      ],
    },
    {
      name: 'stripe',
      displayName: 'Stripe',
      description: 'Global payment processing for cards and digital wallets',
      fields: [
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...', required: true },
        { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...', required: true },
        { key: 'webhookSecret', label: 'Webhook Secret (optional)', type: 'password', placeholder: 'whsec_...' },
      ],
    },
    {
      name: 'flutterwave',
      displayName: 'Flutterwave',
      description: 'African payment gateway with multiple currencies',
      fields: [
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'FLWSECK_...', required: true },
        { key: 'publicKey', label: 'Public Key', type: 'text', placeholder: 'FLWPUBK_...', required: true },
        { key: 'encryptionKey', label: 'Encryption Key (optional)', type: 'password', placeholder: '' },
      ],
    },
    {
      name: 'piggyvest-business',
      displayName: 'PiggyVest Business',
      description: 'Nigerian payment platform with savings integration',
      fields: [
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: '', required: true },
        { key: 'publicKey', label: 'Public Key', type: 'text', placeholder: '', required: true },
        { key: 'webhookSecret', label: 'Webhook Secret (optional)', type: 'password', placeholder: '' },
      ],
    },
  ],
  email: [
    {
      name: 'sendgrid',
      displayName: 'SendGrid',
      description: 'Scalable email delivery with templates and analytics',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'SG...', required: true },
        { key: 'fromEmail', label: 'From Email', type: 'email', placeholder: 'noreply@platform.com', required: true },
        { key: 'fromName', label: 'From Name', type: 'text', placeholder: 'Platform Name', required: true },
      ],
    },
    {
      name: 'smtp',
      displayName: 'SMTP',
      description: 'Custom SMTP server configuration',
      fields: [
        { key: 'host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.example.com', required: true },
        { key: 'port', label: 'Port', type: 'text', placeholder: '587', required: true },
        { key: 'username', label: 'Username', type: 'text', placeholder: '', required: true },
        { key: 'password', label: 'Password', type: 'password', placeholder: '', required: true },
        { key: 'fromEmail', label: 'From Email', type: 'email', placeholder: 'noreply@platform.com', required: true },
        { key: 'fromName', label: 'From Name', type: 'text', placeholder: 'Platform Name', required: true },
        { key: 'encryption', label: 'Encryption (tls/ssl)', type: 'text', placeholder: 'tls' },
      ],
    },
  ],
  sms: [
    {
      name: 'twilio',
      displayName: 'Twilio',
      description: 'Global SMS and voice messaging platform',
      fields: [
        { key: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'AC...', required: true },
        { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: '', required: true },
        { key: 'senderId', label: 'Sender ID / Phone Number', type: 'text', placeholder: '+1234567890', required: true },
      ],
    },
    {
      name: 'termii',
      displayName: 'Termii',
      description: 'African SMS and OTP delivery service',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: '', required: true },
        { key: 'senderId', label: 'Sender ID', type: 'text', placeholder: '', required: true },
      ],
    },
  ],
};

const providerIcons: Record<ProviderType, React.ReactNode> = {
  payment: <CreditCard className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  sms: <MessageSquare className="h-5 w-5" />,
};

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as ProviderType) || 'payment';

  const [activeType, setActiveType] = useState<ProviderType>(initialType);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: settings, isLoading } = usePlatformSettings();
  const configurePayment = useConfigureDefaultPaymentProvider();
  const configureEmail = useConfigureDefaultEmailProvider();
  const configureSms = useConfigureDefaultSmsProvider();
  const removeProvider = useRemoveDefaultProvider();

  const getCurrentProvider = () => {
    if (!settings) return null;
    switch (activeType) {
      case 'payment':
        return settings.defaultPaymentProvider;
      case 'email':
        return settings.defaultEmailProvider;
      case 'sms':
        return settings.defaultSmsProvider;
      default:
        return null;
    }
  };

  const currentProvider = getCurrentProvider();
  const providerConfig = currentProvider
    ? availableProviders[activeType].find((p) => p.name === currentProvider)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    const data: ConfigureProviderRequest = {
      provider: selectedProvider,
      credentials: formData,
    };

    try {
      switch (activeType) {
        case 'payment':
          await configurePayment.mutateAsync(data);
          break;
        case 'email':
          await configureEmail.mutateAsync(data);
          break;
        case 'sms':
          await configureSms.mutateAsync(data);
          break;
      }
      setShowAddModal(false);
      setSelectedProvider(null);
      setFormData({});
    } catch (error) {
      console.error('Failed to configure provider:', error);
    }
  };

  const handleRemove = async () => {
    try {
      await removeProvider.mutateAsync(activeType);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to remove provider:', error);
    }
  };

  const isConfiguring = configurePayment.isPending || configureEmail.isPending || configureSms.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/platform/settings"
          className="rounded-lg border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Default Integrations</h1>
          <p className="text-gray-500">
            Configure platform-wide default providers for tenants
          </p>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-4 border-b">
        {(['payment', 'email', 'sms'] as ProviderType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium capitalize ${
              activeType === type
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {providerIcons[type]}
            {type}
          </button>
        ))}
      </div>

      {/* Current Provider */}
      <div className="rounded-lg border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold text-gray-900">
            Default {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Provider
          </h2>
          {!currentProvider && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Configure Provider
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : !currentProvider ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">
              No default {activeType} provider configured
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Tenants using platform defaults won&apos;t have {activeType} functionality until configured
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700"
            >
              Configure your default provider
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-100 p-3">
                  {providerIcons[activeType]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {providerConfig?.displayName || currentProvider}
                    </span>
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {providerConfig?.description || 'Provider configured'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedProvider(currentProvider);
                    setFormData({});
                    setShowAddModal(true);
                  }}
                  className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Update credentials"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  title="Remove provider"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Changes to default providers will affect all tenants using
          platform defaults. Existing transactions in progress will not be affected.
        </p>
      </div>

      {/* Add/Edit Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="border-b p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentProvider ? 'Update' : 'Configure'} Default{' '}
                {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Provider
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {selectedProvider ? 'Enter your credentials' : 'Select a provider to configure'}
              </p>
            </div>

            <div className="p-6">
              {selectedProvider ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProvider(null);
                        setFormData({});
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      &larr; Back to provider list
                    </button>
                    <h3 className="mt-2 font-medium text-gray-900">
                      Configure{' '}
                      {availableProviders[activeType].find((p) => p.name === selectedProvider)
                        ?.displayName}
                    </h3>
                  </div>

                  {availableProviders[activeType]
                    .find((p) => p.name === selectedProvider)
                    ?.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          required={field.required}
                          value={formData[field.key] || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ))}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedProvider(null);
                        setFormData({});
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isConfiguring}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isConfiguring && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Provider
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {availableProviders[activeType].map((provider) => (
                    <button
                      key={provider.name}
                      onClick={() => setSelectedProvider(provider.name)}
                      className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{provider.displayName}</p>
                        <p className="text-sm text-gray-500">{provider.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Remove Default Provider</h2>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to remove the default {activeType} provider? Tenants using
              platform defaults will lose {activeType} functionality until you configure a new
              provider.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={removeProvider.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {removeProvider.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
      </div>
      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <IntegrationsContent />
    </Suspense>
  );
}
