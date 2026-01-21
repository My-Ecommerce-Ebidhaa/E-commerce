'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/lib/hooks/use-platform';

export default function GeneralSettingsPage() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSettings = useUpdatePlatformSettings();

  const [formData, setFormData] = useState({
    supportEmail: '',
    supportPhone: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    accentColor: '#10B981',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        supportEmail: settings.supportEmail || '',
        supportPhone: settings.supportPhone || '',
        primaryColor: settings.defaultBranding?.primaryColor || '#3B82F6',
        secondaryColor: settings.defaultBranding?.secondaryColor || '#6B7280',
        accentColor: settings.defaultBranding?.accentColor || '#10B981',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({
        supportEmail: formData.supportEmail || undefined,
        supportPhone: formData.supportPhone || undefined,
        defaultBranding: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          accentColor: formData.accentColor,
        },
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-500">Platform branding and support information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Support Information */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Support Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Support Email
              </label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, supportEmail: e.target.value }))
                }
                placeholder="support@platform.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used for platform-wide support communications
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Support Phone
              </label>
              <input
                type="tel"
                value={formData.supportPhone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, supportPhone: e.target.value }))
                }
                placeholder="+1 (555) 123-4567"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Phone number for support inquiries
              </p>
            </div>
          </div>
        </div>

        {/* Default Branding */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Default Branding Colors</h2>
          <p className="mb-4 text-sm text-gray-500">
            These colors will be used as defaults for new tenants
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))
                  }
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Secondary Color
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))
                  }
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Accent Color
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, accentColor: e.target.value }))
                  }
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, accentColor: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Preview</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div
                className="h-16 w-16 rounded-lg"
                style={{ backgroundColor: formData.primaryColor }}
              />
              <span className="mt-1 text-xs text-gray-500">Primary</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="h-16 w-16 rounded-lg"
                style={{ backgroundColor: formData.secondaryColor }}
              />
              <span className="mt-1 text-xs text-gray-500">Secondary</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="h-16 w-16 rounded-lg"
                style={{ backgroundColor: formData.accentColor }}
              />
              <span className="mt-1 text-xs text-gray-500">Accent</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updateSettings.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
