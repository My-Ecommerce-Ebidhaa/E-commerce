import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Platform admins (separate from tenant users)
  await knex.schema.createTable('platform_admins', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.string('role', 50).defaultTo('admin'); // super_admin, admin, support
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Subscription plans
  await knex.schema.createTable('subscription_plans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('slug', 100).notNullable().unique();
    table.text('description');
    table.decimal('price_monthly', 10, 2);
    table.decimal('price_yearly', 10, 2);
    table.jsonb('features').defaultTo('{}');
    table.jsonb('limits').defaultTo('{}'); // max_products, max_staff, etc.
    table.boolean('is_active').defaultTo(true);
    table.integer('sort_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Tenant subscriptions
  await knex.schema.createTable('tenant_subscriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('plan_id').references('id').inTable('subscription_plans').onDelete('SET NULL');
    table.string('status', 50).defaultTo('active'); // active, cancelled, past_due, trialing
    table.timestamp('current_period_start');
    table.timestamp('current_period_end');
    table.boolean('cancel_at_period_end').defaultTo(false);
    table.string('payment_provider', 50); // stripe, paystack
    table.string('external_subscription_id', 255);
    table.timestamp('trial_ends_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('status');
  });

  // Platform audit log
  await knex.schema.createTable('platform_audit_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('admin_id').references('id').inTable('platform_admins').onDelete('SET NULL');
    table.string('action', 100).notNullable();
    table.string('entity_type', 50); // tenant, plan, admin, etc.
    table.uuid('entity_id');
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.specificType('ip_address', 'inet');
    table.text('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('admin_id');
    table.index(['entity_type', 'entity_id']);
    table.index('created_at');
  });

  // Tenant audit log
  await knex.schema.createTable('tenant_audit_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 100).notNullable();
    table.string('entity_type', 50);
    table.uuid('entity_id');
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.specificType('ip_address', 'inet');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'created_at']);
    table.index('user_id');
  });

  // Seed default subscription plans
  await knex('subscription_plans').insert([
    {
      name: 'Free',
      slug: 'free',
      description: 'Perfect for getting started',
      price_monthly: 0,
      price_yearly: 0,
      features: JSON.stringify({
        products: true,
        orders: true,
        basic_analytics: true,
      }),
      limits: JSON.stringify({
        max_products: 25,
        max_staff: 1,
        max_orders_per_month: 50,
      }),
      sort_order: 0,
    },
    {
      name: 'Starter',
      slug: 'starter',
      description: 'For small businesses',
      price_monthly: 29,
      price_yearly: 290,
      features: JSON.stringify({
        products: true,
        orders: true,
        analytics: true,
        discounts: true,
        custom_domain: true,
      }),
      limits: JSON.stringify({
        max_products: 500,
        max_staff: 3,
        max_orders_per_month: 500,
      }),
      sort_order: 1,
    },
    {
      name: 'Professional',
      slug: 'professional',
      description: 'For growing businesses',
      price_monthly: 79,
      price_yearly: 790,
      features: JSON.stringify({
        products: true,
        orders: true,
        analytics: true,
        discounts: true,
        custom_domain: true,
        api_access: true,
        webhooks: true,
        priority_support: true,
      }),
      limits: JSON.stringify({
        max_products: 5000,
        max_staff: 10,
        max_orders_per_month: 5000,
      }),
      sort_order: 2,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large businesses',
      price_monthly: 299,
      price_yearly: 2990,
      features: JSON.stringify({
        products: true,
        orders: true,
        analytics: true,
        discounts: true,
        custom_domain: true,
        api_access: true,
        webhooks: true,
        priority_support: true,
        dedicated_support: true,
        custom_integrations: true,
        sla: true,
      }),
      limits: JSON.stringify({
        max_products: -1, // Unlimited
        max_staff: -1,
        max_orders_per_month: -1,
      }),
      sort_order: 3,
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tenant_audit_log');
  await knex.schema.dropTableIfExists('platform_audit_log');
  await knex.schema.dropTableIfExists('tenant_subscriptions');
  await knex.schema.dropTableIfExists('subscription_plans');
  await knex.schema.dropTableIfExists('platform_admins');
}
