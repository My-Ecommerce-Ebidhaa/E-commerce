import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Payment providers configuration per tenant
  await knex.schema.createTable('tenant_payment_providers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('provider', 50).notNullable(); // stripe, paystack, flutterwave, etc.
    table.boolean('is_active').defaultTo(false);
    table.boolean('is_default').defaultTo(false);
    table.text('credentials').notNullable(); // Encrypted JSON
    table.jsonb('settings').defaultTo('{}'); // Provider-specific settings
    table.string('webhook_secret', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['tenant_id', 'provider']);
    table.index('tenant_id');
  });

  // Email providers configuration per tenant
  await knex.schema.createTable('tenant_email_providers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('provider', 50).notNullable(); // sendgrid, mailgun, ses, smtp, etc.
    table.boolean('is_active').defaultTo(false);
    table.text('credentials').notNullable(); // Encrypted JSON
    table.jsonb('settings').defaultTo('{}'); // from_email, from_name, etc.
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['tenant_id', 'provider']);
    table.index('tenant_id');
  });

  // SMS providers configuration per tenant
  await knex.schema.createTable('tenant_sms_providers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('provider', 50).notNullable(); // twilio, termii, africastalking, etc.
    table.boolean('is_active').defaultTo(false);
    table.text('credentials').notNullable(); // Encrypted JSON
    table.jsonb('settings').defaultTo('{}'); // sender_id, etc.
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['tenant_id', 'provider']);
    table.index('tenant_id');
  });

  // Notification templates per tenant
  await knex.schema.createTable('notification_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('type', 50).notNullable(); // order_confirmation, shipping_update, etc.
    table.string('channel', 20).notNullable(); // email, sms
    table.string('subject', 255); // For email
    table.text('body').notNullable();
    table.jsonb('variables').defaultTo('[]'); // Available template variables
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['tenant_id', 'type', 'channel']);
    table.index('tenant_id');
  });

  // Notification log
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('type', 50).notNullable();
    table.string('channel', 20).notNullable();
    table.string('recipient', 255).notNullable();
    table.string('status', 20).notNullable(); // pending, sent, delivered, failed
    table.string('provider', 50);
    table.string('provider_message_id', 255);
    table.text('error');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('sent_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'created_at']);
    table.index(['tenant_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('notification_templates');
  await knex.schema.dropTableIfExists('tenant_sms_providers');
  await knex.schema.dropTableIfExists('tenant_email_providers');
  await knex.schema.dropTableIfExists('tenant_payment_providers');
}
