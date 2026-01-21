'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  CreditCard,
  Mail,
  MessageSquare,
  Check,
  Settings,
  Trash2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

type ProviderType = 'payment' | 'email' | 'sms';

interface Provider {
  id: string;
  name: string;
  displayName: string;
  type: ProviderType;
  isActive: boolean;
  isDefault?: boolean;
  configuredAt?: string;
}

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'paystack',
    displayName: 'Paystack',
    type: 'payment',
    isActive: true,
    isDefault: true,
    configuredAt: '2 weeks ago',
  },
  {
    id: '2',
    name: 'sendgrid',
    displayName: 'SendGrid',
    type: 'email',
    isActive: true,
    configuredAt: '1 month ago',
  },
];

const availableProviders = {
  payment: [
    { name: 'paystack', displayName: 'Paystack', description: 'Nigerian payment gateway with cards, bank transfers, and USSD' },
    { name: 'stripe', displayName: 'Stripe', description: 'Global payment processing for cards and digital wallets' },
    { name: 'flutterwave', displayName: 'Flutterwave', description: 'African payment gateway with multiple currencies' },
  ],
  email: [
    { name: 'sendgrid', displayName: 'SendGrid', description: 'Scalable email delivery with templates and analytics' },
    { name: 'smtp', displayName: 'SMTP', description: 'Custom SMTP server configuration' },
  ],
  sms: [
    { name: 'twilio', displayName: 'Twilio', description: 'Global SMS and voice messaging platform' },
    { name: 'termii', displayName: 'Termii', description: 'African SMS and OTP delivery service' },
  ],
};

const providerIcons: Record<ProviderType, React.ReactNode> = {
  payment: <CreditCard className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  sms: <MessageSquare className="h-5 w-5" />,
};

function ProvidersContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as ProviderType) || 'payment';

  const [activeType, setActiveType] = useState<ProviderType>(initialType);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const configuredProviders = mockProviders.filter((p) => p.type === activeType);
  const availableForType = availableProviders[activeType].filter(
    (p) => !configuredProviders.find((cp) => cp.name === p.name)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Provider Configuration</h1>
        <p className="text-gray-500">
          Configure payment, email, and SMS providers for your store
        </p>
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
            {type} Providers
          </button>
        ))}
      </div>

      {/* Configured Providers */}
      <div className="rounded-lg border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold text-gray-900">
            Configured {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Providers
          </h2>
          {availableForType.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Provider
            </button>
          )}
        </div>

        {configuredProviders.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">
              No {activeType} providers configured yet
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700"
            >
              Configure your first provider
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {configuredProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-gray-100 p-3">
                    {providerIcons[provider.type]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {provider.displayName}
                      </span>
                      {provider.isDefault && (
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Configured {provider.configuredAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        provider.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-sm text-gray-500">
                      {provider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="border-b p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Add {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Provider
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select a provider to configure
              </p>
            </div>

            <div className="p-6">
              {selectedProvider ? (
                <form className="space-y-4">
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => setSelectedProvider(null)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      ← Back to provider list
                    </button>
                    <h3 className="mt-2 font-medium text-gray-900">
                      Configure{' '}
                      {availableForType.find((p) => p.name === selectedProvider)
                        ?.displayName}
                    </h3>
                  </div>

                  {/* Dynamic form fields based on provider */}
                  {selectedProvider === 'paystack' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Secret Key
                        </label>
                        <input
                          type="password"
                          placeholder="sk_live_..."
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Public Key
                        </label>
                        <input
                          type="text"
                          placeholder="pk_live_..."
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Webhook Secret (optional)
                        </label>
                        <input
                          type="password"
                          placeholder="whsec_..."
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {selectedProvider === 'sendgrid' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          API Key
                        </label>
                        <input
                          type="password"
                          placeholder="SG..."
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          From Email
                        </label>
                        <input
                          type="email"
                          placeholder="noreply@yourstore.com"
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          From Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your Store"
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {selectedProvider === 'twilio' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Account SID
                        </label>
                        <input
                          type="text"
                          placeholder="AC..."
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Auth Token
                        </label>
                        <input
                          type="password"
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Sender ID / Phone Number
                        </label>
                        <input
                          type="text"
                          placeholder="+1234567890"
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="setDefault"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="setDefault" className="text-sm text-gray-700">
                      Set as default provider
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Save Provider
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {availableForType.map((provider) => (
                    <button
                      key={provider.name}
                      onClick={() => setSelectedProvider(provider.name)}
                      className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {provider.displayName}
                        </p>
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
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
      </div>
      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProvidersContent />
    </Suspense>
  );
}
