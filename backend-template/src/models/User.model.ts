import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';
import { UserRole } from '@/shared/enums/generic.enum';

export class User extends BaseModel {
  static tableName = 'users';

  tenant_id!: string;
  email!: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role!: UserRole;
  email_verified!: boolean;
  reset_token?: string;
  reset_token_expires_at?: Date;

  // Relations
  tenant?: Model;
  addresses?: Model[];
  orders?: Model[];
  reviews?: Model[];
  wishlist?: Model[];
  cart?: Model;

  // Computed
  get fullName(): string {
    return [this.first_name, this.last_name].filter(Boolean).join(' ');
  }

  static get relationMappings(): RelationMappings {
    const { Tenant } = require('./Tenant.model');
    const { Address } = require('./Address.model');
    const { Order } = require('./Order.model');
    const { Review } = require('./Review.model');
    const { WishlistItem } = require('./WishlistItem.model');
    const { Cart } = require('./Cart.model');

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'users.tenant_id',
          to: 'tenants.id',
        },
      },
      addresses: {
        relation: Model.HasManyRelation,
        modelClass: Address,
        join: {
          from: 'users.id',
          to: 'addresses.user_id',
        },
      },
      orders: {
        relation: Model.HasManyRelation,
        modelClass: Order,
        join: {
          from: 'users.id',
          to: 'orders.user_id',
        },
      },
      reviews: {
        relation: Model.HasManyRelation,
        modelClass: Review,
        join: {
          from: 'users.id',
          to: 'reviews.user_id',
        },
      },
      wishlist: {
        relation: Model.HasManyRelation,
        modelClass: WishlistItem,
        join: {
          from: 'users.id',
          to: 'wishlist_items.user_id',
        },
      },
      cart: {
        relation: Model.HasOneRelation,
        modelClass: Cart,
        join: {
          from: 'users.id',
          to: 'carts.user_id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tenant_id', 'email'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        tenant_id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email', maxLength: 255 },
        password_hash: { type: ['string', 'null'], maxLength: 255 },
        first_name: { type: ['string', 'null'], maxLength: 100 },
        last_name: { type: ['string', 'null'], maxLength: 100 },
        phone: { type: ['string', 'null'], maxLength: 20 },
        role: { type: 'string', enum: Object.values(UserRole) },
        email_verified: { type: 'boolean' },
      },
    };
  }

  $formatJson(json: Record<string, unknown>) {
    json = super.$formatJson(json);
    delete json.password_hash;
    delete json.reset_token;
    delete json.reset_token_expires_at;
    return json;
  }
}
