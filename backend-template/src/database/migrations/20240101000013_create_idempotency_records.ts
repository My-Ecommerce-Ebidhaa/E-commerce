import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('idempotency_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('idempotency_key', 255).notNullable();
    table.string('request_type', 50).notNullable();
    table.string('request_path', 255);
    table.string('request_method', 10);
    table.jsonb('request_hash').notNullable();
    table.jsonb('response_data');
    table.integer('response_status');
    table.integer('attempts').defaultTo(1);
    table.string('status', 20).defaultTo('processing');
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);

    table.unique(['tenant_id', 'idempotency_key']);
    table.index(['tenant_id', 'expires_at']);
    table.index(['status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('idempotency_records');
}
