import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Tenant-specific roles
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('slug', 100).notNullable();
    table.text('description');
    table.boolean('is_system').defaultTo(false); // System roles can't be deleted
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['tenant_id', 'slug']);
    table.index('tenant_id');
  });

  // Role-Permission mapping
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['role_id', 'permission_id']);
    table.index('role_id');
  });

  // User-Role mapping
  await knex.schema.createTable('user_roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('assigned_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['user_id', 'role_id']);
    table.index('user_id');
  });

  // Staff invitations
  await knex.schema.createTable('staff_invitations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.string('email', 255).notNullable();
    table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('invited_by').references('id').inTable('users').onDelete('SET NULL');
    table.string('token', 255).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('accepted_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'email']);
    table.index('token');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('staff_invitations');
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('roles');
}
