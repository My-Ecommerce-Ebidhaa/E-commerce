import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';

export interface VariantOptions {
  color?: string;
  size?: string;
  material?: string;
  [key: string]: string | undefined;
}

export class ProductVariant extends BaseModel {
  static tableName = 'product_variants';

  product_id!: string;
  name!: string;
  sku?: string;
  price?: number;
  quantity!: number;
  options!: VariantOptions;

  // Relations
  product?: Model;

  static get relationMappings(): RelationMappings {
    const { Product } = require('./Product.model');

    return {
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: {
          from: 'product_variants.product_id',
          to: 'products.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['product_id', 'name', 'options'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        product_id: { type: 'string', format: 'uuid' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        sku: { type: ['string', 'null'], maxLength: 100 },
        price: { type: ['number', 'null'], minimum: 0 },
        quantity: { type: 'integer', minimum: 0 },
        options: { type: 'object' },
      },
    };
  }
}
