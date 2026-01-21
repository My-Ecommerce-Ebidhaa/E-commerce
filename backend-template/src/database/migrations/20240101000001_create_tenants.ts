import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tenants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('slug', 100).unique().notNullable();
    table.string('custom_domain', 255).unique();
    table.string('template_type', 50).notNullable().defaultTo('GENERAL');
    table.jsonb('settings').defaultTo('{}');
    table.string('status', 20).defaultTo('active');
    table.timestamps(true, true);

    table.index(['slug']);
    table.index(['custom_domain']);
    table.index(['status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('tenants');
}
