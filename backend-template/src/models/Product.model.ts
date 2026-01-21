import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';
import { ProductStatus } from '@/shared/enums/generic.enum';

export interface ProductAttributes {
  // Auto dealership
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  mileage?: number;
  vin?: string;
  fuel_type?: string;
  transmission?: string;
  drivetrain?: string;
  exterior_color?: string;
  interior_color?: string;
  engine_size?: string;
  features?: string[];
  condition?: string;
  accidents?: number;

  // Fashion
  brand?: string;
  material?: string;
  care_instructions?: string;
  fit?: string;
  gender?: string;
  season?: string[];
  style?: string;

  // Electronics
  warranty?: string;
  specifications?: Record<string, string>;
  connectivity?: string[];
  power_consumption?: string;

  // Generic
  [key: string]: unknown;
}

export class Product extends BaseModel {
  static tableName = 'products';

  tenant_id!: string;
  category_id?: string;
  name!: string;
  slug!: string;
  description?: string;
  short_description?: string;
  status!: ProductStatus;

  // Pricing
  price!: number;
  compare_at_price?: number;
  cost_price?: number;

  // Inventory
  sku?: string;
  barcode?: string;
  track_inventory!: boolean;
  quantity!: number;
  low_stock_threshold!: number;

  // Flexible attributes
  attributes!: ProductAttributes;

  // SEO
  meta_title?: string;
  meta_description?: string;

  // Relations
  tenant?: Model;
  category?: Model;
  variants?: Model[];
  media?: Model[];
  reviews?: Model[];

  static get relationMappings(): RelationMappings {
    const { Tenant } = require('./Tenant.model');
    const { Category } = require('./Category.model');
    const { ProductVariant } = require('./ProductVariant.model');
    const { ProductMedia } = require('./ProductMedia.model');
    const { Review } = require('./Review.model');

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'products.tenant_id',
          to: 'tenants.id',
        },
      },
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: 'products.category_id',
          to: 'categories.id',
        },
      },
      variants: {
        relation: Model.HasManyRelation,
        modelClass: ProductVariant,
        join: {
          from: 'products.id',
          to: 'product_variants.product_id',
        },
      },
      media: {
        relation: Model.HasManyRelation,
        modelClass: ProductMedia,
        join: {
          from: 'products.id',
          to: 'product_media.product_id',
        },
      },
      reviews: {
        relation: Model.HasManyRelation,
        modelClass: Review,
        join: {
          from: 'products.id',
          to: 'reviews.product_id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tenant_id', 'name', 'slug', 'price'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        tenant_id: { type: 'string', format: 'uuid' },
        category_id: { type: ['string', 'null'], format: 'uuid' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        slug: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: ['string', 'null'] },
        short_description: { type: ['string', 'null'], maxLength: 500 },
        status: { type: 'string', enum: Object.values(ProductStatus) },
        price: { type: 'number', minimum: 0 },
        compare_at_price: { type: ['number', 'null'], minimum: 0 },
        cost_price: { type: ['number', 'null'], minimum: 0 },
        sku: { type: ['string', 'null'], maxLength: 100 },
        barcode: { type: ['string', 'null'], maxLength: 100 },
        track_inventory: { type: 'boolean' },
        quantity: { type: 'integer', minimum: 0 },
        low_stock_threshold: { type: 'integer', minimum: 0 },
        attributes: { type: 'object' },
        meta_title: { type: ['string', 'null'], maxLength: 255 },
        meta_description: { type: ['string', 'null'], maxLength: 500 },
      },
    };
  }
}
