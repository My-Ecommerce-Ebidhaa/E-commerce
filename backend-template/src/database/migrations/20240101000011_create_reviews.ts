import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('reviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('rating').notNullable();
    table.string('title', 255);
    table.text('content');
    table.boolean('is_verified').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['product_id', 'user_id']);
    table.index(['product_id']);
    table.check('?? >= 1 AND ?? <= 5', ['rating', 'rating']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('reviews');
}
