import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('order_number', 50).notNullable();

    // Contact
    table.string('email', 255).notNullable();
    table.string('phone', 20);

    // Addresses (snapshot)
    table.jsonb('shipping_address').notNullable();
    table.jsonb('billing_address').notNullable();

    // Totals
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('shipping_cost', 10, 2).notNullable().defaultTo(0);
    table.decimal('tax_amount', 10, 2).notNullable().defaultTo(0);
    table.decimal('discount_amount', 10, 2).notNullable().defaultTo(0);
    table.decimal('total', 10, 2).notNullable();

    // Status
    table.string('status', 20).defaultTo('pending');
    table.string('payment_status', 20).defaultTo('pending');
    table.string('fulfillment_status', 20).defaultTo('unfulfilled');

    // Payment
    table.string('payment_method', 50);
    table.string('payment_intent_id', 255);

    // Shipping
    table.string('shipping_method', 100);
    table.string('tracking_number', 100);
    table.string('tracking_url', 500);

    // Inventory reservation
    table.string('reservation_id', 100);

    table.text('notes');
    table.timestamps(true, true);

    table.unique(['tenant_id', 'order_number']);
    table.index(['tenant_id', 'status']);
    table.index(['tenant_id', 'user_id']);
    table.index(['payment_intent_id']);
  });

  await knex.schema.createTable('order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('RESTRICT');
    table.uuid('variant_id').references('id').inTable('product_variants').onDelete('RESTRICT');

    // Snapshot at time of order
    table.string('name', 255).notNullable();
    table.string('sku', 100);
    table.decimal('price', 10, 2).notNullable();
    table.integer('quantity').notNullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['order_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('order_items');
  await knex.schema.dropTable('orders');
}
