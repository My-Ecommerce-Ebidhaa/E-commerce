import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('addresses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('label', 50);
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('company', 255);
    table.string('address_1', 255).notNullable();
    table.string('address_2', 255);
    table.string('city', 100).notNullable();
    table.string('state', 100).notNullable();
    table.string('postal_code', 20).notNullable();
    table.string('country', 2).notNullable();
    table.string('phone', 20);
    table.boolean('is_default').defaultTo(false);
    table.timestamps(true, true);

    table.index(['user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('addresses');
}
