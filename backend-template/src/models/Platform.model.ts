import { Model } from 'objection';
import { BaseModel } from './Base.model';

export class PlatformAdmin extends BaseModel {
  static tableName = 'platform_admins';

  id!: string;
  email!: string;
  password_hash!: string;
  first_name?: string;
  last_name?: string;
  role!: 'super_admin' | 'admin' | 'support';
  is_active!: boolean;
  last_login_at?: string;
  created_at!: string;
  updated_at!: string;

  // Hide password hash in JSON responses
  $formatJson(json: any) {
    json = super.$formatJson(json);
    delete json.password_hash;
    return json;
  }
}

export interface PlanFeatures {
  products?: boolean;
  orders?: boolean;
  analytics?: boolean;
  basic_analytics?: boolean;
  discounts?: boolean;
  custom_domain?: boolean;
  api_access?: boolean;
  webhooks?: boolean;
  priority_support?: boolean;
  dedicated_support?: boolean;
  custom_integrations?: boolean;
  sla?: boolean;
}

export interface PlanLimits {
  max_products?: number;
  max_staff?: number;
  max_orders_per_month?: number;
}

export class SubscriptionPlan extends BaseModel {
  static tableName = 'subscription_plans';

  id!: string;
  name!: string;
  slug!: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  features!: PlanFeatures;
  limits!: PlanLimits;
  is_active!: boolean;
  sort_order!: number;
  created_at!: string;
  updated_at!: string;
}

export class TenantSubscription extends BaseModel {
  static tableName = 'tenant_subscriptions';

  id!: string;
  tenant_id!: string;
  plan_id?: string;
  status!: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end!: boolean;
  payment_provider?: string;
  external_subscription_id?: string;
  trial_ends_at?: string;
  created_at!: string;
  updated_at!: string;

  // Relations
  plan?: SubscriptionPlan;

  static get relationMappings() {
    return {
      plan: {
        relation: Model.BelongsToOneRelation,
        modelClass: SubscriptionPlan,
        join: {
          from: 'tenant_subscriptions.plan_id',
          to: 'subscription_plans.id',
        },
      },
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./Tenant.model').Tenant,
        join: {
          from: 'tenant_subscriptions.tenant_id',
          to: 'tenants.id',
        },
      },
    };
  }
}

export class PlatformAuditLog extends BaseModel {
  static tableName = 'platform_audit_log';

  id!: string;
  admin_id?: string;
  action!: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at!: string;
}

export class TenantAuditLog extends BaseModel {
  static tableName = 'tenant_audit_log';

  id!: string;
  tenant_id!: string;
  user_id?: string;
  action!: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  created_at!: string;
}
