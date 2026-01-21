'use client';

import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Users,
  DollarSign,
  MoreVertical,
  Star,
  Crown,
  Zap,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    products: number | 'unlimited';
    staff: number | 'unlimited';
    storage: string;
  };
  isPopular: boolean;
  isActive: boolean;
  subscriberCount: number;
}

const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'Free Trial',
    description: '14-day trial to explore all features',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Up to 50 products',
      '1 staff account',
      '1GB storage',
      'Basic analytics',
      'Email support',
    ],
    limits: {
      products: 50,
      staff: 1,
      storage: '1GB',
    },
    isPopular: false,
    isActive: true,
    subscriberCount: 23,
  },
  {
    id: '2',
    name: 'Starter',
    description: 'Perfect for small businesses just getting started',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Up to 500 products',
      '3 staff accounts',
      '10GB storage',
      'Advanced analytics',
      'Email & chat support',
      'Custom domain',
    ],
    limits: {
      products: 500,
      staff: 3,
      storage: '10GB',
    },
    isPopular: false,
    isActive: true,
    subscriberCount: 45,
  },
  {
    id: '3',
    name: 'Professional',
    description: 'For growing businesses with more needs',
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: [
      'Up to 5,000 products',
      '10 staff accounts',
      '50GB storage',
      'Advanced analytics',
      'Priority support',
      'Custom domain',
      'API access',
      'Multiple payment gateways',
    ],
    limits: {
      products: 5000,
      staff: 10,
      storage: '50GB',
    },
    isPopular: true,
    isActive: true,
    subscriberCount: 67,
  },
  {
    id: '4',
    name: 'Enterprise',
    description: 'For large businesses with custom requirements',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: [
      'Unlimited products',
      'Unlimited staff accounts',
      '500GB storage',
      'Advanced analytics',
      'Dedicated support',
      'Custom domain',
      'API access',
      'Multiple payment gateways',
      'White-label solution',
      'SLA guarantee',
    ],
    limits: {
      products: 'unlimited',
      staff: 'unlimited',
      storage: '500GB',
    },
    isPopular: false,
    isActive: true,
    subscriberCount: 21,
  },
];

export default function PlansPage() {
  const [plans] = useState<Plan[]>(mockPlans);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const totalMRR = plans
    .filter(p => p.isActive)
    .reduce((sum, plan) => sum + (plan.monthlyPrice * plan.subscriberCount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500">Manage your pricing plans and features</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total MRR</p>
              <p className="text-xl font-bold text-gray-900">${totalMRR.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Subscribers</p>
              <p className="text-xl font-bold text-gray-900">
                {plans.reduce((sum, p) => sum + p.subscriberCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Plans</p>
              <p className="text-xl font-bold text-gray-900">
                {plans.filter(p => p.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border bg-white shadow-sm ${
              plan.isPopular ? 'border-blue-500 ring-2 ring-blue-500' : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                  <Star className="h-3 w-3" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowActionMenu(showActionMenu === plan.id ? null : plan.id)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {showActionMenu === plan.id && (
                    <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
                      <button
                        onClick={() => {
                          setEditPlan(plan);
                          setShowActionMenu(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {plan.isPopular ? (
                          <>
                            <X className="h-4 w-4" />
                            Remove Popular
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4" />
                            Mark Popular
                          </>
                        )}
                      </button>
                      <hr className="my-1" />
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                </span>
                <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>

              {/* Subscribers */}
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                {plan.subscriberCount} subscribers
              </div>

              {/* Features */}
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Limits */}
              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Products</span>
                  <span className="font-medium text-gray-900">
                    {plan.limits.products === 'unlimited' ? 'Unlimited' : plan.limits.products}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Staff</span>
                  <span className="font-medium text-gray-900">
                    {plan.limits.staff === 'unlimited' ? 'Unlimited' : plan.limits.staff}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Storage</span>
                  <span className="font-medium text-gray-900">{plan.limits.storage}</span>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    plan.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Plan Modal */}
      {(showCreateModal || editPlan) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              {editPlan ? 'Edit Plan' : 'Create New Plan'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {editPlan
                ? 'Update the plan details below'
                : 'Create a new subscription plan for your tenants'}
            </p>

            <form className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                <input
                  type="text"
                  defaultValue={editPlan?.name}
                  placeholder="e.g., Pro Plan"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  defaultValue={editPlan?.description}
                  rows={2}
                  placeholder="Brief description of the plan"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Price</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      defaultValue={editPlan?.monthlyPrice}
                      placeholder="29"
                      className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Yearly Price</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      defaultValue={editPlan?.yearlyPrice}
                      placeholder="290"
                      className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Limits</label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">Products</label>
                    <input
                      type="text"
                      defaultValue={editPlan?.limits.products}
                      placeholder="500 or unlimited"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Staff</label>
                    <input
                      type="text"
                      defaultValue={editPlan?.limits.staff}
                      placeholder="5 or unlimited"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Storage</label>
                    <input
                      type="text"
                      defaultValue={editPlan?.limits.storage}
                      placeholder="10GB"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Features (one per line)
                </label>
                <textarea
                  defaultValue={editPlan?.features.join('\n')}
                  rows={4}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={editPlan?.isPopular ?? false}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mark as popular</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={editPlan?.isActive ?? true}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditPlan(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  {editPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
