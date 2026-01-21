import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Tax rates
  await knex.schema.createTable('tax_rates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.decimal('rate', 5, 2).notNullable(); // 7.50 for 7.5%
    table.string('country', 2); // ISO country code
    table.string('state', 100);
    table.string('postal_code_pattern', 50);
    table.boolean('is_compound').defaultTo(false);
    table.boolean('is_shipping_taxable').defaultTo(true);
    table.integer('priority').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
  });

  // Shipping zones
  await knex.schema.createTable('shipping_zones', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.jsonb('countries').defaultTo('[]');
    table.jsonb('states').defaultTo('[]');
    table.jsonb('postal_codes').defaultTo('[]');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
  });

  // Shipping methods
  await knex.schema.createTable('shipping_methods', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('zone_id').references('id').inTable('shipping_zones').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.text('description');
    table.string('calculation_type', 20).defaultTo('flat'); // flat, weight, price, item
    table.decimal('base_rate', 10, 2);
    table.decimal('per_kg_rate', 10, 2);
    table.decimal('per_item_rate', 10, 2);
    table.decimal('free_shipping_threshold', 10, 2);
    table.decimal('min_order_amount', 10, 2);
    table.decimal('max_order_amount', 10, 2);
    table.integer('estimated_days_min');
    table.integer('estimated_days_max');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('zone_id');
  });

  // API keys for tenant integrations
  await knex.schema.createTable('api_keys', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('key_hash', 255).notNullable();
    table.string('key_prefix', 10).notNullable(); // First 8 chars for identification
    table.jsonb('permissions').defaultTo('[]');
    table.integer('rate_limit').defaultTo(1000); // Requests per hour
    table.timestamp('last_used_at');
    table.timestamp('expires_at');
    table.boolean('is_active').defaultTo(true);
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('key_prefix');
  });

  // Tenant outgoing webhooks
  await knex.schema.createTable('tenant_webhooks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('url', 500).notNullable();
    table.jsonb('events').defaultTo('[]'); // ["order.created", "order.paid"]
    table.string('secret', 255);
    table.jsonb('headers').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.integer('retry_count').defaultTo(3);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
  });

  // Webhook delivery log
  await knex.schema.createTable('webhook_deliveries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('webhook_id').references('id').inTable('tenant_webhooks').onDelete('CASCADE');
    table.string('event_type', 100);
    table.jsonb('payload');
    table.integer('response_status');
    table.text('response_body');
    table.integer('attempts').defaultTo(0);
    table.timestamp('delivered_at');
    table.timestamp('next_retry_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('webhook_id');
    table.index('next_retry_at');
  });

  // Customer segments
  await knex.schema.createTable('customer_segments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.text('description');
    table.string('type', 20).defaultTo('dynamic'); // static, dynamic
    table.jsonb('conditions').defaultTo('[]');
    table.integer('customer_count').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
  });

  // Customer segment members (for static segments)
  await knex.schema.createTable('customer_segment_members', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('segment_id').references('id').inTable('customer_segments').onDelete('CASCADE');
    table.uuid('customer_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('added_at').defaultTo(knex.fn.now());

    table.unique(['segment_id', 'customer_id']);
  });

  // Inventory alerts
  await knex.schema.createTable('inventory_alerts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.uuid('variant_id').references('id').inTable('product_variants').onDelete('CASCADE');
    table.string('alert_type', 50).notNullable(); // low_stock, out_of_stock
    table.integer('threshold');
    table.boolean('is_active').defaultTo(true);
    table.boolean('notify_email').defaultTo(true);
    table.boolean('notify_sms').defaultTo(false);
    table.timestamp('last_triggered_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('product_id');
  });

  // Transactions table for tracking all money movement
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('order_id').references('id').inTable('orders').onDelete('SET NULL');
    table.string('type', 50).notNullable(); // payment, payout, refund, adjustment
    table.string('direction', 10).notNullable(); // credit, debit
    table.decimal('amount', 12, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.string('status', 20).notNullable(); // pending, completed, failed
    table.string('provider', 50); // paystack, stripe, etc.
    table.string('provider_reference', 255);
    table.string('reference', 255).notNullable().unique();
    table.text('description');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('completed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('order_id');
    table.index('reference');
    table.index('provider_reference');
  });

  // Payouts (settlements to tenant bank accounts)
  await knex.schema.createTable('payouts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.decimal('amount', 12, 2).notNullable();
    table.decimal('fee', 10, 2).defaultTo(0);
    table.decimal('net_amount', 12, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.string('status', 20).notNullable(); // pending, processing, settled, failed
    table.string('provider', 50);
    table.string('provider_reference', 255);
    table.string('reference', 255).notNullable().unique();
    table.jsonb('bank_account').defaultTo('{}'); // Snapshot of bank details
    table.text('error_message');
    table.timestamp('settled_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('status');
    table.index('reference');
  });

  // Tenant bank accounts for payouts
  await knex.schema.createTable('tenant_bank_accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('account_name', 255).notNullable();
    table.string('account_number', 50).notNullable();
    table.string('bank_code', 20).notNullable();
    table.string('bank_name', 100).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.string('recipient_code', 255); // Provider's recipient ID
    table.string('provider', 50); // Which provider verified/created this
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_default').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tenant_bank_accounts');
  await knex.schema.dropTableIfExists('payouts');
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('inventory_alerts');
  await knex.schema.dropTableIfExists('customer_segment_members');
  await knex.schema.dropTableIfExists('customer_segments');
  await knex.schema.dropTableIfExists('webhook_deliveries');
  await knex.schema.dropTableIfExists('tenant_webhooks');
  await knex.schema.dropTableIfExists('api_keys');
  await knex.schema.dropTableIfExists('shipping_methods');
  await knex.schema.dropTableIfExists('shipping_zones');
  await knex.schema.dropTableIfExists('tax_rates');
}
