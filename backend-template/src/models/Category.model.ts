import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';

export class Category extends BaseModel {
  static tableName = 'categories';

  tenant_id!: string;
  parent_id?: string;
  name!: string;
  slug!: string;
  description?: string;
  image?: string;
  position!: number;
  is_active!: boolean;

  // Relations
  tenant?: Model;
  parent?: Category;
  children?: Category[];
  products?: Model[];

  static get relationMappings(): RelationMappings {
    const { Tenant } = require('./Tenant.model');
    const { Product } = require('./Product.model');

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'categories.tenant_id',
          to: 'tenants.id',
        },
      },
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: 'categories.parent_id',
          to: 'categories.id',
        },
      },
      children: {
        relation: Model.HasManyRelation,
        modelClass: Category,
        join: {
          from: 'categories.id',
          to: 'categories.parent_id',
        },
      },
      products: {
        relation: Model.HasManyRelation,
        modelClass: Product,
        join: {
          from: 'categories.id',
          to: 'products.category_id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tenant_id', 'name', 'slug'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        tenant_id: { type: 'string', format: 'uuid' },
        parent_id: { type: ['string', 'null'], format: 'uuid' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        slug: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: ['string', 'null'] },
        image: { type: ['string', 'null'], maxLength: 500 },
        position: { type: 'integer' },
        is_active: { type: 'boolean' },
      },
    };
  }
}
