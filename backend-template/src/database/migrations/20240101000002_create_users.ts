import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('email', 255).notNullable();
    table.string('password_hash', 255);
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.string('phone', 20);
    table.string('role', 20).defaultTo('customer');
    table.boolean('email_verified').defaultTo(false);
    table.string('reset_token', 255);
    table.timestamp('reset_token_expires_at');
    table.timestamps(true, true);

    table.unique(['tenant_id', 'email']);
    table.index(['tenant_id']);
    table.index(['email']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
