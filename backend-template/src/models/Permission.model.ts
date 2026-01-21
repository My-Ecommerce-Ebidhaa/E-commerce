import { Model } from 'objection';
import { BaseModel } from './Base.model';

export class Permission extends BaseModel {
  static tableName = 'permissions';

  id!: string;
  name!: string;
  slug!: string;
  module!: string;
  description?: string;
  created_at!: string;

  static get relationMappings() {
    const { Role } = require('./Role.model');

    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: 'permissions.id',
          through: {
            from: 'role_permissions.permission_id',
            to: 'role_permissions.role_id',
          },
          to: 'roles.id',
        },
      },
    };
  }
}
