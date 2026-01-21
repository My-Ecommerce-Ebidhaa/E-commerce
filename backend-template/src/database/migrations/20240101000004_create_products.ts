import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL');

    // Core fields
    table.string('name', 255).notNullable();
    table.string('slug', 255).notNullable();
    table.text('description');
    table.string('short_description', 500);
    table.string('status', 20).defaultTo('draft');

    // Pricing
    table.decimal('price', 10, 2).notNullable();
    table.decimal('compare_at_price', 10, 2);
    table.decimal('cost_price', 10, 2);

    // Inventory
    table.string('sku', 100);
    table.string('barcode', 100);
    table.boolean('track_inventory').defaultTo(true);
    table.integer('quantity').defaultTo(0);
    table.integer('low_stock_threshold').defaultTo(5);

    // Flexible attributes (template-specific)
    table.jsonb('attributes').defaultTo('{}');

    // SEO
    table.string('meta_title', 255);
    table.string('meta_description', 500);

    table.timestamps(true, true);

    table.unique(['tenant_id', 'slug']);
    table.index(['tenant_id', 'status']);
    table.index(['tenant_id', 'category_id']);
    table.index(['tenant_id', 'sku']);
  });

  // Create GIN index for JSONB attributes (PostgreSQL specific)
  await knex.raw(`
    CREATE INDEX idx_products_attributes ON products USING GIN (attributes);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('products');
}
