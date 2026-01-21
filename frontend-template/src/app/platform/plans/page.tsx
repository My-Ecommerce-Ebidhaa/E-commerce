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
  Zap,
} from 'lucide-react';
import { usePlans, useDeletePlan, useUpdatePlan } from '@/lib/hooks/use-platform';
import type { Plan } from '@/lib/api/platform';

function formatStorage(bytes?: number): string {
  if (!bytes) return 'N/A';
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(0)}GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)}MB`;
  return `${bytes} bytes`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-6">
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlansPage() {
  const { data, isLoading, error } = usePlans();
  const deletePlan = useDeletePlan();
  const updatePlan = useUpdatePlan();

  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this plan? This cannot be undone.')) {
      deletePlan.mutate(id);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    updatePlan.mutate({
      id: plan.id,
      data: { isActive: !plan.isActive },
    });
    setShowActionMenu(null);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const plans = data?.plans || [];
  const activePlans = plans.filter(p => p.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500">Manage your pricing plans and features</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create Plan
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Failed to load plans. Please try again later.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Plans</p>
              <p className="text-xl font-bold text-gray-900">{plans.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Plans</p>
              <p className="text-xl font-bold text-gray-900">{activePlans.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactive Plans</p>
              <p className="text-xl font-bold text-gray-900">{plans.length - activePlans.length}</p>
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
      {plans.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Zap className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No plans yet</h3>
          <p className="mt-2 text-gray-500">Create your first subscription plan to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border bg-white shadow-sm ${
                !plan.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {plan.description || 'No description'}
                    </p>
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
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(plan)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          disabled={updatePlan.isPending}
                        >
                          {plan.isActive ? (
                            <>
                              <X className="h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Activate
                            </>
                          )}
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            handleDelete(plan.id);
                            setShowActionMenu(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          disabled={deletePlan.isPending}
                        >
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
                    ${billingCycle === 'monthly' ? plan.price : Math.round(plan.price * 10)}
                  </span>
                  <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>

                {/* Billing Period Badge */}
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {plan.billingPeriod}
                  </span>
                </div>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-sm text-gray-400">
                        +{plan.features.length - 5} more features
                      </li>
                    )}
                  </ul>
                )}

                {/* Limits */}
                {plan.limits && (
                  <div className="mt-6 space-y-2 border-t pt-4">
                    {plan.limits.products !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Products</span>
                        <span className="font-medium text-gray-900">
                          {plan.limits.products === 0 ? 'Unlimited' : plan.limits.products}
                        </span>
                      </div>
                    )}
                    {plan.limits.staff !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Staff</span>
                        <span className="font-medium text-gray-900">
                          {plan.limits.staff === 0 ? 'Unlimited' : plan.limits.staff}
                        </span>
                      </div>
                    )}
                    {plan.limits.storage !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Storage</span>
                        <span className="font-medium text-gray-900">
                          {formatStorage(plan.limits.storage)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

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
      )}
    </div>
  );
}
