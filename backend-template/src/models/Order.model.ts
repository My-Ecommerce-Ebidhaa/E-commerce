import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@/shared/enums/generic.enum';

export interface OrderAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export class Order extends BaseModel {
  static tableName = 'orders';

  tenant_id!: string;
  user_id?: string;
  order_number!: string;

  // Contact
  email!: string;
  phone?: string;

  // Addresses
  shipping_address!: OrderAddress;
  billing_address!: OrderAddress;

  // Totals
  subtotal!: number;
  shipping_cost!: number;
  tax_amount!: number;
  discount_amount!: number;
  total!: number;

  // Status
  status!: OrderStatus;
  payment_status!: PaymentStatus;
  fulfillment_status!: FulfillmentStatus;

  // Payment
  payment_method?: string;
  payment_intent_id?: string;

  // Shipping
  shipping_method?: string;
  tracking_number?: string;
  tracking_url?: string;

  // Inventory
  reservation_id?: string;

  notes?: string;

  // Relations
  tenant?: Model;
  user?: Model;
  items?: OrderItem[];

  static get relationMappings(): RelationMappings {
    const { Tenant } = require('./Tenant.model');
    const { User } = require('./User.model');
    const { OrderItem } = require('./OrderItem.model');

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'orders.tenant_id',
          to: 'tenants.id',
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'orders.user_id',
          to: 'users.id',
        },
      },
      items: {
        relation: Model.HasManyRelation,
        modelClass: OrderItem,
        join: {
          from: 'orders.id',
          to: 'order_items.order_id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tenant_id', 'order_number', 'email', 'shipping_address', 'billing_address', 'subtotal', 'total'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        tenant_id: { type: 'string', format: 'uuid' },
        user_id: { type: ['string', 'null'], format: 'uuid' },
        order_number: { type: 'string', maxLength: 50 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        phone: { type: ['string', 'null'], maxLength: 20 },
        shipping_address: { type: 'object' },
        billing_address: { type: 'object' },
        subtotal: { type: 'number', minimum: 0 },
        shipping_cost: { type: 'number', minimum: 0 },
        tax_amount: { type: 'number', minimum: 0 },
        discount_amount: { type: 'number', minimum: 0 },
        total: { type: 'number', minimum: 0 },
        status: { type: 'string', enum: Object.values(OrderStatus) },
        payment_status: { type: 'string', enum: Object.values(PaymentStatus) },
        fulfillment_status: { type: 'string', enum: Object.values(FulfillmentStatus) },
        payment_method: { type: ['string', 'null'], maxLength: 50 },
        payment_intent_id: { type: ['string', 'null'], maxLength: 255 },
        shipping_method: { type: ['string', 'null'], maxLength: 100 },
        tracking_number: { type: ['string', 'null'], maxLength: 100 },
        tracking_url: { type: ['string', 'null'], maxLength: 500 },
        reservation_id: { type: ['string', 'null'], maxLength: 100 },
        notes: { type: ['string', 'null'] },
      },
    };
  }
}

export class OrderItem extends Model {
  static tableName = 'order_items';

  id!: string;
  order_id!: string;
  product_id!: string;
  variant_id?: string;
  name!: string;
  sku?: string;
  price!: number;
  quantity!: number;
  created_at!: Date;

  // Relations
  order?: Order;
  product?: Model;
  variant?: Model;

  static get relationMappings(): RelationMappings {
    const { Product } = require('./Product.model');
    const { ProductVariant } = require('./ProductVariant.model');

    return {
      order: {
        relation: Model.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: 'order_items.order_id',
          to: 'orders.id',
        },
      },
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: {
          from: 'order_items.product_id',
          to: 'products.id',
        },
      },
      variant: {
        relation: Model.BelongsToOneRelation,
        modelClass: ProductVariant,
        join: {
          from: 'order_items.variant_id',
          to: 'product_variants.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['order_id', 'product_id', 'name', 'price', 'quantity'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        order_id: { type: 'string', format: 'uuid' },
        product_id: { type: 'string', format: 'uuid' },
        variant_id: { type: ['string', 'null'], format: 'uuid' },
        name: { type: 'string', maxLength: 255 },
        sku: { type: ['string', 'null'], maxLength: 100 },
        price: { type: 'number', minimum: 0 },
        quantity: { type: 'integer', minimum: 1 },
      },
    };
  }
}
