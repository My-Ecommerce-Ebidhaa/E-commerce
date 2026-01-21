import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('parent_id').references('id').inTable('categories').onDelete('SET NULL');
    table.string('name', 255).notNullable();
    table.string('slug', 255).notNullable();
    table.text('description');
    table.string('image', 500);
    table.integer('position').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.unique(['tenant_id', 'slug']);
    table.index(['tenant_id', 'parent_id']);
    table.index(['tenant_id', 'is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('categories');
}
