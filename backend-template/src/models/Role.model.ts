import { Model } from 'objection';
import { BaseModel } from './Base.model';
import { Permission } from './Permission.model';
import { User } from './User.model';

export class Role extends BaseModel {
  static tableName = 'roles';

  id!: string;
  tenant_id!: string;
  name!: string;
  slug!: string;
  description?: string;
  is_system!: boolean;
  created_at!: string;
  updated_at!: string;

  // Relations
  permissions?: Permission[];
  users?: User[];

  static get relationMappings() {
    return {
      permissions: {
        relation: Model.ManyToManyRelation,
        modelClass: Permission,
        join: {
          from: 'roles.id',
          through: {
            from: 'role_permissions.role_id',
            to: 'role_permissions.permission_id',
          },
          to: 'permissions.id',
        },
      },
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'roles.id',
          through: {
            from: 'user_roles.role_id',
            to: 'user_roles.user_id',
          },
          to: 'users.id',
        },
      },
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./Tenant.model').Tenant,
        join: {
          from: 'roles.tenant_id',
          to: 'tenants.id',
        },
      },
    };
  }
}

export class RolePermission extends BaseModel {
  static tableName = 'role_permissions';

  id!: string;
  role_id!: string;
  permission_id!: string;
  created_at!: string;
}

export class UserRole extends BaseModel {
  static tableName = 'user_roles';

  id!: string;
  user_id!: string;
  role_id!: string;
  assigned_by?: string;
  created_at!: string;
}

export class StaffInvitation extends BaseModel {
  static tableName = 'staff_invitations';

  id!: string;
  tenant_id!: string;
  email!: string;
  role_id!: string;
  invited_by?: string;
  token!: string;
  expires_at!: string;
  accepted_at?: string;
  created_at!: string;

  // Relations
  role?: Role;

  static get relationMappings() {
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: Role,
        join: {
          from: 'staff_invitations.role_id',
          to: 'roles.id',
        },
      },
    };
  }
}
