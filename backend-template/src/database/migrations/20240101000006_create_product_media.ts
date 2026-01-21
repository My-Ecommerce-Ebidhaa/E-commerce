import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('product_media', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.string('type', 20).notNullable().defaultTo('image');
    table.string('url', 500).notNullable();
    table.string('alt_text', 255);
    table.integer('position').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['product_id', 'position']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('product_media');
}
