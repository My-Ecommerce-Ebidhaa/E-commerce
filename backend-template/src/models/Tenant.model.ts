import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';
import { TemplateType, TenantStatus } from '@/shared/enums/generic.enum';

export interface TenantSettings {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  currency?: string;
  timezone?: string;
}

export class Tenant extends BaseModel {
  static tableName = 'tenants';

  name!: string;
  slug!: string;
  custom_domain?: string;
  template_type!: TemplateType;
  settings!: TenantSettings;
  status!: TenantStatus;

  // Relations
  users?: Model[];
  products?: Model[];
  categories?: Model[];
  orders?: Model[];

  static get relationMappings(): RelationMappings {
    const { User } = require('./User.model');
    const { Product } = require('./Product.model');
    const { Category } = require('./Category.model');
    const { Order } = require('./Order.model');

    return {
      users: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'tenants.id',
          to: 'users.tenant_id',
        },
      },
      products: {
        relation: Model.HasManyRelation,
        modelClass: Product,
        join: {
          from: 'tenants.id',
          to: 'products.tenant_id',
        },
      },
      categories: {
        relation: Model.HasManyRelation,
        modelClass: Category,
        join: {
          from: 'tenants.id',
          to: 'categories.tenant_id',
        },
      },
      orders: {
        relation: Model.HasManyRelation,
        modelClass: Order,
        join: {
          from: 'tenants.id',
          to: 'orders.tenant_id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        slug: { type: 'string', minLength: 1, maxLength: 100 },
        custom_domain: { type: ['string', 'null'], maxLength: 255 },
        template_type: { type: 'string', enum: Object.values(TemplateType) },
        settings: { type: 'object' },
        status: { type: 'string', enum: Object.values(TenantStatus) },
      },
    };
  }
}
