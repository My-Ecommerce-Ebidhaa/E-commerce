import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('product_variants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('sku', 100);
    table.decimal('price', 10, 2);
    table.integer('quantity').defaultTo(0);
    table.jsonb('options').notNullable().defaultTo('{}');
    table.timestamps(true, true);

    table.index(['product_id']);
    table.index(['sku']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('product_variants');
}
