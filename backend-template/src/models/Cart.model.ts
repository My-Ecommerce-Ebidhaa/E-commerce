import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';

export class Cart extends BaseModel {
  static tableName = 'carts';

  tenant_id!: string;
  user_id?: string;
  session_id?: string;
  discount_code?: string;
  discount_amount?: number;

  // Relations
  tenant?: Model;
  user?: Model;
  items?: CartItem[];

  static get relationMappings(): RelationMappings {
    const { Tenant } = require('./Tenant.model');
    const { User } = require('./User.model');
    const { CartItem } = require('./CartItem.model');

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'carts.tenant_id',
          to: 'tenants.id',
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'carts.user_id',
          to: 'users.id',
        },
      },
      items: {
        relation: Model.HasManyRelation,
        modelClass: CartItem,
        join: {
          from: 'carts.id',
          to: 'cart_items.cart_id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tenant_id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        tenant_id: { type: 'string', format: 'uuid' },
        user_id: { type: ['string', 'null'], format: 'uuid' },
        session_id: { type: ['string', 'null'], maxLength: 100 },
        discount_code: { type: ['string', 'null'], maxLength: 50 },
        discount_amount: { type: ['number', 'null'], minimum: 0 },
      },
    };
  }
}

export class CartItem extends BaseModel {
  static tableName = 'cart_items';

  cart_id!: string;
  product_id!: string;
  variant_id?: string;
  quantity!: number;

  // Relations
  cart?: Cart;
  product?: Model;
  variant?: Model;

  static get relationMappings(): RelationMappings {
    const { Product } = require('./Product.model');
    const { ProductVariant } = require('./ProductVariant.model');

    return {
      cart: {
        relation: Model.BelongsToOneRelation,
        modelClass: Cart,
        join: {
          from: 'cart_items.cart_id',
          to: 'carts.id',
        },
      },
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: {
          from: 'cart_items.product_id',
          to: 'products.id',
        },
      },
      variant: {
        relation: Model.BelongsToOneRelation,
        modelClass: ProductVariant,
        join: {
          from: 'cart_items.variant_id',
          to: 'product_variants.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['cart_id', 'product_id', 'quantity'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        cart_id: { type: 'string', format: 'uuid' },
        product_id: { type: 'string', format: 'uuid' },
        variant_id: { type: ['string', 'null'], format: 'uuid' },
        quantity: { type: 'integer', minimum: 1 },
      },
    };
  }
}
