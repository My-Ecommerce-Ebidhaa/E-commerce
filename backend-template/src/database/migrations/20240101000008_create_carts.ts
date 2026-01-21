import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('carts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('user_id').unique().references('id').inTable('users').onDelete('CASCADE');
    table.string('session_id', 100).unique();
    table.string('discount_code', 50);
    table.decimal('discount_amount', 10, 2);
    table.timestamps(true, true);

    table.index(['tenant_id', 'session_id']);
  });

  await knex.schema.createTable('cart_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('cart_id').notNullable().references('id').inTable('carts').onDelete('CASCADE');
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('variant_id').references('id').inTable('product_variants').onDelete('CASCADE');
    table.integer('quantity').notNullable().defaultTo(1);
    table.timestamps(true, true);

    table.unique(['cart_id', 'product_id', 'variant_id']);
    table.index(['cart_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('cart_items');
  await knex.schema.dropTable('carts');
}
