import { Model, RelationMappings } from 'objection';
import { MediaType } from '@/shared/enums/generic.enum';

export class ProductMedia extends Model {
  static tableName = 'product_media';

  id!: string;
  product_id!: string;
  type!: MediaType;
  url!: string;
  alt_text?: string;
  position!: number;
  created_at!: Date;

  // Relations
  product?: Model;

  static get relationMappings(): RelationMappings {
    const { Product } = require('./Product.model');

    return {
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: {
          from: 'product_media.product_id',
          to: 'products.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['product_id', 'type', 'url'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        product_id: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: Object.values(MediaType) },
        url: { type: 'string', minLength: 1, maxLength: 500 },
        alt_text: { type: ['string', 'null'], maxLength: 255 },
        position: { type: 'integer', minimum: 0 },
      },
    };
  }
}
