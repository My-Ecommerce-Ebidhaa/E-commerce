'use client';

import { useState } from 'react';
import { Plus, Shield, Edit2, Trash2, Users, Check, X } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  slug: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
}

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Store Manager',
    description: 'Full access to store management',
    isSystem: false,
    userCount: 2,
    permissions: ['products:*', 'orders:*', 'customers:read', 'analytics:read'],
  },
  {
    id: '2',
    name: 'Sales Associate',
    description: 'Can manage orders and view products',
    isSystem: false,
    userCount: 3,
    permissions: ['products:read', 'orders:read', 'orders:update'],
  },
  {
    id: '3',
    name: 'Inventory Manager',
    description: 'Manages product inventory',
    isSystem: false,
    userCount: 1,
    permissions: ['products:read', 'products:update'],
  },
];

const permissionModules = [
  {
    module: 'Dashboard',
    permissions: [
      { id: 'd1', slug: 'dashboard:read', name: 'View Dashboard' },
    ],
  },
  {
    module: 'Products',
    permissions: [
      { id: 'p1', slug: 'products:read', name: 'View Products' },
      { id: 'p2', slug: 'products:create', name: 'Create Products' },
      { id: 'p3', slug: 'products:update', name: 'Update Products' },
      { id: 'p4', slug: 'products:delete', name: 'Delete Products' },
    ],
  },
  {
    module: 'Orders',
    permissions: [
      { id: 'o1', slug: 'orders:read', name: 'View Orders' },
      { id: 'o2', slug: 'orders:update', name: 'Update Orders' },
      { id: 'o3', slug: 'orders:delete', name: 'Delete Orders' },
    ],
  },
  {
    module: 'Customers',
    permissions: [
      { id: 'c1', slug: 'customers:read', name: 'View Customers' },
      { id: 'c2', slug: 'customers:update', name: 'Update Customers' },
    ],
  },
  {
    module: 'Analytics',
    permissions: [
      { id: 'a1', slug: 'analytics:read', name: 'View Analytics' },
    ],
  },
  {
    module: 'Staff',
    permissions: [
      { id: 's1', slug: 'staff:read', name: 'View Staff' },
      { id: 's2', slug: 'staff:create', name: 'Invite Staff' },
      { id: 's3', slug: 'staff:update', name: 'Update Staff' },
      { id: 's4', slug: 'staff:delete', name: 'Remove Staff' },
    ],
  },
  {
    module: 'Roles',
    permissions: [
      { id: 'r1', slug: 'roles:read', name: 'View Roles' },
      { id: 'r2', slug: 'roles:create', name: 'Create Roles' },
      { id: 'r3', slug: 'roles:update', name: 'Update Roles' },
      { id: 'r4', slug: 'roles:delete', name: 'Delete Roles' },
      { id: 'r5', slug: 'roles:assign', name: 'Assign Roles' },
    ],
  },
  {
    module: 'Settings',
    permissions: [
      { id: 'st1', slug: 'settings:read', name: 'View Settings' },
      { id: 'st2', slug: 'settings:update', name: 'Update Settings' },
    ],
  },
];

export default function RolesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions);
    setShowCreateModal(true);
  };

  const togglePermission = (slug: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(slug)
        ? prev.filter((p) => p !== slug)
        : [...prev, slug]
    );
  };

  const toggleModulePermissions = (modulePermissions: { slug: string }[]) => {
    const slugs = modulePermissions.map((p) => p.slug);
    const allSelected = slugs.every((s) => selectedPermissions.includes(s));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !slugs.includes(p)));
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...slugs])]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500">Manage access levels for your team</p>
        </div>
        <button
          onClick={() => {
            setSelectedRole(null);
            setSelectedPermissions([]);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockRoles.map((role) => (
          <div
            key={role.id}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {role.userCount} users
              </span>
              <span>{role.permissions.length} permissions</span>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t pt-4">
              <button
                onClick={() => openEditModal(role)}
                className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              {!role.isSystem && (
                <button className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="sticky top-0 border-b bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Configure role details and permissions
              </p>
            </div>

            <form className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedRole?.name}
                    placeholder="e.g., Store Manager"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    defaultValue={selectedRole?.description}
                    placeholder="Brief description of this role..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions
                  </label>
                  <div className="space-y-4 rounded-lg border p-4">
                    {permissionModules.map((module) => (
                      <div key={module.module}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {module.module}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleModulePermissions(module.permissions)}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            {module.permissions.every((p) =>
                              selectedPermissions.includes(p.slug)
                            )
                              ? 'Deselect All'
                              : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {module.permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-center gap-2 rounded p-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(
                                  permission.slug
                                )}
                                onChange={() => togglePermission(permission.slug)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                {permission.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {selectedRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
