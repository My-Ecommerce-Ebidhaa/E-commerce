import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add provider default flags to tenants table
  await knex.schema.alterTable('tenants', (table) => {
    // Whether tenant uses platform's default payment provider
    table.boolean('use_default_payment_provider').defaultTo(true);
    // Whether tenant uses platform's default email provider
    table.boolean('use_default_email_provider').defaultTo(true);
    // Whether tenant uses platform's default SMS provider
    table.boolean('use_default_sms_provider').defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('tenants', (table) => {
    table.dropColumn('use_default_payment_provider');
    table.dropColumn('use_default_email_provider');
    table.dropColumn('use_default_sms_provider');
  });
}
