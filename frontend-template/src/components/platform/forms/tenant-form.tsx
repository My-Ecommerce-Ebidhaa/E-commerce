'use client';

import { useState } from 'react';
import {
  Building2,
  Palette,
  Phone,
  FileText,
  Globe,
  Shield,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { TenantSettings, CreateTenantFullRequest } from '@/lib/api/platform';

interface TenantFormProps {
  initialData?: Partial<CreateTenantFullRequest>;
  onSubmit: (data: CreateTenantFullRequest) => void;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
}

const TEMPLATE_TYPES = [
  { value: 'GENERAL', label: 'General Store' },
  { value: 'FASHION', label: 'Fashion & Apparel' },
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'AUTO_DEALERSHIP', label: 'Auto Dealership' },
  { value: 'GROCERY', label: 'Grocery' },
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'NGN', label: 'Nigerian Naira (NGN)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
  { value: 'GHS', label: 'Ghanaian Cedi (GHS)' },
  { value: 'KES', label: 'Kenyan Shilling (KES)' },
  { value: 'ZAR', label: 'South African Rand (ZAR)' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
];

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            {icon}
          </div>
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="border-t p-4">{children}</div>}
    </div>
  );
}

export function TenantForm({ initialData, onSubmit, isSubmitting, mode }: TenantFormProps) {
  const [formData, setFormData] = useState<CreateTenantFullRequest>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    domain: initialData?.domain || '',
    templateType: initialData?.templateType || 'GENERAL',
    settings: initialData?.settings || {},
    useDefaultPaymentProvider: initialData?.useDefaultPaymentProvider ?? true,
    useDefaultEmailProvider: initialData?.useDefaultEmailProvider ?? true,
    useDefaultSmsProvider: initialData?.useDefaultSmsProvider ?? true,
  });

  const updateSettings = (updates: Partial<TenantSettings>) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info - Always visible */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="font-medium text-gray-900">Basic Information</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                  slug: mode === 'create' ? generateSlug(e.target.value) : prev.slug,
                }));
              }}
              placeholder="My Awesome Store"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="my-awesome-store"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Used in URLs: store.platform.com/{formData.slug || 'your-slug'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Custom Domain</label>
            <input
              type="text"
              value={formData.domain || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value }))}
              placeholder="www.mystore.com"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Template Type</label>
            <select
              value={formData.templateType}
              onChange={(e) => setFormData((prev) => ({ ...prev, templateType: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {TEMPLATE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Branding */}
      <CollapsibleSection title="Branding" icon={<Palette className="h-5 w-5" />} defaultOpen={mode === 'create'}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo URL</label>
              <input
                type="url"
                value={formData.settings?.logo || ''}
                onChange={(e) => updateSettings({ logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Favicon URL</label>
              <input
                type="url"
                value={formData.settings?.favicon || ''}
                onChange={(e) => updateSettings({ favicon: e.target.value })}
                placeholder="https://example.com/favicon.ico"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={formData.settings?.primaryColor || '#3B82F6'}
                  onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.settings?.primaryColor || '#3B82F6'}
                  onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={formData.settings?.secondaryColor || '#6B7280'}
                  onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.settings?.secondaryColor || '#6B7280'}
                  onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Accent Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={formData.settings?.accentColor || '#10B981'}
                  onChange={(e) => updateSettings({ accentColor: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.settings?.accentColor || '#10B981'}
                  onChange={(e) => updateSettings({ accentColor: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gradient</label>
            <div className="mt-1 grid gap-4 sm:grid-cols-3">
              <div>
                <input
                  type="color"
                  value={formData.settings?.gradientColors?.start || '#3B82F6'}
                  onChange={(e) =>
                    updateSettings({
                      gradientColors: {
                        ...formData.settings?.gradientColors,
                        start: e.target.value,
                      },
                    })
                  }
                  className="h-10 w-full cursor-pointer rounded border border-gray-300"
                />
                <p className="mt-1 text-xs text-gray-500">Start</p>
              </div>
              <div>
                <input
                  type="color"
                  value={formData.settings?.gradientColors?.end || '#8B5CF6'}
                  onChange={(e) =>
                    updateSettings({
                      gradientColors: {
                        ...formData.settings?.gradientColors,
                        end: e.target.value,
                      },
                    })
                  }
                  className="h-10 w-full cursor-pointer rounded border border-gray-300"
                />
                <p className="mt-1 text-xs text-gray-500">End</p>
              </div>
              <div>
                <select
                  value={formData.settings?.gradientColors?.direction || 'to-right'}
                  onChange={(e) =>
                    updateSettings({
                      gradientColors: {
                        ...formData.settings?.gradientColors,
                        direction: e.target.value as 'to-right' | 'to-bottom' | 'to-bottom-right',
                      },
                    })
                  }
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="to-right">Left to Right</option>
                  <option value="to-bottom">Top to Bottom</option>
                  <option value="to-bottom-right">Diagonal</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Direction</p>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Contact */}
      <CollapsibleSection title="Contact Information" icon={<Phone className="h-5 w-5" />}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input
                type="email"
                value={formData.settings?.contactEmail || ''}
                onChange={(e) => updateSettings({ contactEmail: e.target.value })}
                placeholder="contact@store.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Support Email</label>
              <input
                type="email"
                value={formData.settings?.supportEmail || ''}
                onChange={(e) => updateSettings({ supportEmail: e.target.value })}
                placeholder="support@store.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
              <input
                type="tel"
                value={formData.settings?.contactPhone || ''}
                onChange={(e) => updateSettings({ contactPhone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
              <input
                type="tel"
                value={formData.settings?.whatsappNumber || ''}
                onChange={(e) => updateSettings({ whatsappNumber: e.target.value })}
                placeholder="+1 234 567 8900"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={formData.settings?.address || ''}
              onChange={(e) => updateSettings({ address: e.target.value })}
              placeholder="123 Business St, City, Country"
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Social Links</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="url"
                value={formData.settings?.socialLinks?.facebook || ''}
                onChange={(e) =>
                  updateSettings({
                    socialLinks: { ...formData.settings?.socialLinks, facebook: e.target.value },
                  })
                }
                placeholder="Facebook URL"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="url"
                value={formData.settings?.socialLinks?.instagram || ''}
                onChange={(e) =>
                  updateSettings({
                    socialLinks: { ...formData.settings?.socialLinks, instagram: e.target.value },
                  })
                }
                placeholder="Instagram URL"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="url"
                value={formData.settings?.socialLinks?.twitter || ''}
                onChange={(e) =>
                  updateSettings({
                    socialLinks: { ...formData.settings?.socialLinks, twitter: e.target.value },
                  })
                }
                placeholder="Twitter/X URL"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="url"
                value={formData.settings?.socialLinks?.linkedin || ''}
                onChange={(e) =>
                  updateSettings({
                    socialLinks: { ...formData.settings?.socialLinks, linkedin: e.target.value },
                  })
                }
                placeholder="LinkedIn URL"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="url"
                value={formData.settings?.socialLinks?.youtube || ''}
                onChange={(e) =>
                  updateSettings({
                    socialLinks: { ...formData.settings?.socialLinks, youtube: e.target.value },
                  })
                }
                placeholder="YouTube URL"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="url"
                value={formData.settings?.socialLinks?.tiktok || ''}
                onChange={(e) =>
                  updateSettings({
                    socialLinks: { ...formData.settings?.socialLinks, tiktok: e.target.value },
                  })
                }
                placeholder="TikTok URL"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* About */}
      <CollapsibleSection title="About & Description" icon={<FileText className="h-5 w-5" />}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Short Description</label>
            <input
              type="text"
              value={formData.settings?.about?.shortDescription || ''}
              onChange={(e) =>
                updateSettings({
                  about: { ...formData.settings?.about, shortDescription: e.target.value },
                })
              }
              placeholder="A brief tagline for the store"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">About Us</label>
            <textarea
              value={formData.settings?.about?.longDescription || ''}
              onChange={(e) =>
                updateSettings({
                  about: { ...formData.settings?.about, longDescription: e.target.value },
                })
              }
              placeholder="Tell customers about your business..."
              rows={4}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mission</label>
              <textarea
                value={formData.settings?.about?.mission || ''}
                onChange={(e) =>
                  updateSettings({
                    about: { ...formData.settings?.about, mission: e.target.value },
                  })
                }
                placeholder="Our mission is..."
                rows={2}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vision</label>
              <textarea
                value={formData.settings?.about?.vision || ''}
                onChange={(e) =>
                  updateSettings({
                    about: { ...formData.settings?.about, vision: e.target.value },
                  })
                }
                placeholder="Our vision is..."
                rows={2}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Regional */}
      <CollapsibleSection title="Regional Settings" icon={<Globe className="h-5 w-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              value={formData.settings?.currency || 'USD'}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={formData.settings?.timezone || 'UTC'}
              onChange={(e) => updateSettings({ timezone: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* KYC/Business Info */}
      <CollapsibleSection title="Business Information (KYC)" icon={<Shield className="h-5 w-5" />}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Registration Number
              </label>
              <input
                type="text"
                value={formData.settings?.kyc?.businessRegistrationNumber || ''}
                onChange={(e) =>
                  updateSettings({
                    kyc: { ...formData.settings?.kyc, businessRegistrationNumber: e.target.value },
                  })
                }
                placeholder="RC-123456"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax ID</label>
              <input
                type="text"
                value={formData.settings?.kyc?.taxId || ''}
                onChange={(e) =>
                  updateSettings({
                    kyc: { ...formData.settings?.kyc, taxId: e.target.value },
                  })
                }
                placeholder="TIN-123456789"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Type</label>
              <select
                value={formData.settings?.kyc?.businessType || ''}
                onChange={(e) =>
                  updateSettings({
                    kyc: {
                      ...formData.settings?.kyc,
                      businessType: e.target.value as 'sole_proprietorship' | 'partnership' | 'corporation' | 'llc',
                    },
                  })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select type...</option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registered Country</label>
              <input
                type="text"
                value={formData.settings?.kyc?.registeredCountry || ''}
                onChange={(e) =>
                  updateSettings({
                    kyc: { ...formData.settings?.kyc, registeredCountry: e.target.value },
                  })
                }
                placeholder="Nigeria"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Registered Address</label>
            <textarea
              value={formData.settings?.kyc?.registeredAddress || ''}
              onChange={(e) =>
                updateSettings({
                  kyc: { ...formData.settings?.kyc, registeredAddress: e.target.value },
                })
              }
              placeholder="Official business address as registered"
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Provider Configuration */}
      <CollapsibleSection title="Provider Configuration" icon={<Settings className="h-5 w-5" />}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Choose whether this tenant uses platform default providers or configures their own.
          </p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.useDefaultPaymentProvider}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    useDefaultPaymentProvider: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Use Platform Default Payment Provider</p>
                <p className="text-sm text-gray-500">
                  Tenant will use the platform&apos;s payment provider configuration
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.useDefaultEmailProvider}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    useDefaultEmailProvider: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Use Platform Default Email Provider</p>
                <p className="text-sm text-gray-500">
                  Tenant will use the platform&apos;s email provider configuration
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.useDefaultSmsProvider}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    useDefaultSmsProvider: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Use Platform Default SMS Provider</p>
                <p className="text-sm text-gray-500">
                  Tenant will use the platform&apos;s SMS provider configuration
                </p>
              </div>
            </label>
          </div>
        </div>
      </CollapsibleSection>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Tenant' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
