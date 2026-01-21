import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Global permissions table
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('slug', 150).notNullable().unique();
    table.string('module', 50).notNullable(); // products, orders, customers, etc.
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('module');
  });

  // Seed default permissions
  const permissions = [
    // Dashboard
    { name: 'View Dashboard', slug: 'dashboard.view', module: 'dashboard' },

    // Products
    { name: 'View Products', slug: 'products.view', module: 'products' },
    { name: 'Create Products', slug: 'products.create', module: 'products' },
    { name: 'Edit Products', slug: 'products.edit', module: 'products' },
    { name: 'Delete Products', slug: 'products.delete', module: 'products' },
    { name: 'Manage Inventory', slug: 'products.inventory', module: 'products' },
    { name: 'Import Products', slug: 'products.import', module: 'products' },
    { name: 'Export Products', slug: 'products.export', module: 'products' },

    // Categories
    { name: 'View Categories', slug: 'categories.view', module: 'categories' },
    { name: 'Create Categories', slug: 'categories.create', module: 'categories' },
    { name: 'Edit Categories', slug: 'categories.edit', module: 'categories' },
    { name: 'Delete Categories', slug: 'categories.delete', module: 'categories' },

    // Orders
    { name: 'View Orders', slug: 'orders.view', module: 'orders' },
    { name: 'Update Order Status', slug: 'orders.update_status', module: 'orders' },
    { name: 'Cancel Orders', slug: 'orders.cancel', module: 'orders' },
    { name: 'Process Refunds', slug: 'orders.refund', module: 'orders' },
    { name: 'Export Orders', slug: 'orders.export', module: 'orders' },

    // Customers
    { name: 'View Customers', slug: 'customers.view', module: 'customers' },
    { name: 'Edit Customers', slug: 'customers.edit', module: 'customers' },
    { name: 'Delete Customers', slug: 'customers.delete', module: 'customers' },
    { name: 'Export Customers', slug: 'customers.export', module: 'customers' },

    // Discounts
    { name: 'View Discounts', slug: 'discounts.view', module: 'discounts' },
    { name: 'Create Discounts', slug: 'discounts.create', module: 'discounts' },
    { name: 'Edit Discounts', slug: 'discounts.edit', module: 'discounts' },
    { name: 'Delete Discounts', slug: 'discounts.delete', module: 'discounts' },

    // Analytics
    { name: 'View Sales Analytics', slug: 'analytics.sales', module: 'analytics' },
    { name: 'View Customer Analytics', slug: 'analytics.customers', module: 'analytics' },
    { name: 'View Product Analytics', slug: 'analytics.products', module: 'analytics' },
    { name: 'Export Reports', slug: 'analytics.export', module: 'analytics' },

    // Staff
    { name: 'View Staff', slug: 'staff.view', module: 'staff' },
    { name: 'Invite Staff', slug: 'staff.invite', module: 'staff' },
    { name: 'Edit Staff', slug: 'staff.edit', module: 'staff' },
    { name: 'Remove Staff', slug: 'staff.remove', module: 'staff' },

    // Roles
    { name: 'View Roles', slug: 'roles.view', module: 'roles' },
    { name: 'Create Roles', slug: 'roles.create', module: 'roles' },
    { name: 'Edit Roles', slug: 'roles.edit', module: 'roles' },
    { name: 'Delete Roles', slug: 'roles.delete', module: 'roles' },

    // Settings
    { name: 'View Settings', slug: 'settings.view', module: 'settings' },
    { name: 'Manage General Settings', slug: 'settings.general', module: 'settings' },
    { name: 'Manage Payment Settings', slug: 'settings.payments', module: 'settings' },
    { name: 'Manage Shipping Settings', slug: 'settings.shipping', module: 'settings' },
    { name: 'Manage Tax Settings', slug: 'settings.tax', module: 'settings' },
    { name: 'Manage Notification Settings', slug: 'settings.notifications', module: 'settings' },
    { name: 'Manage API Keys', slug: 'settings.api_keys', module: 'settings' },
    { name: 'Manage Webhooks', slug: 'settings.webhooks', module: 'settings' },
  ];

  await knex('permissions').insert(permissions);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('permissions');
}
