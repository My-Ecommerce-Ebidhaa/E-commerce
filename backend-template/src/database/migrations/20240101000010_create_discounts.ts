import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('discounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('code', 50).notNullable();
    table.string('type', 20).notNullable(); // percentage, fixed_amount, free_shipping
    table.decimal('value', 10, 2).notNullable();
    table.decimal('min_purchase', 10, 2);
    table.integer('max_uses');
    table.integer('used_count').defaultTo(0);
    table.timestamp('starts_at').notNullable();
    table.timestamp('ends_at');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.unique(['tenant_id', 'code']);
    table.index(['tenant_id', 'is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('discounts');
}
