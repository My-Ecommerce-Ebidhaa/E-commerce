import { Model, RelationMappings } from 'objection';

export class Review extends Model {
  static tableName = 'reviews';

  id!: string;
  product_id!: string;
  user_id!: string;
  rating!: number;
  title?: string;
  content?: string;
  is_verified!: boolean;
  created_at!: Date;

  // Relations
  product?: Model;
  user?: Model;

  static get relationMappings(): RelationMappings {
    const { Product } = require('./Product.model');
    const { User } = require('./User.model');

    return {
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: {
          from: 'reviews.product_id',
          to: 'products.id',
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'reviews.user_id',
          to: 'users.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['product_id', 'user_id', 'rating'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        product_id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        rating: { type: 'integer', minimum: 1, maximum: 5 },
        title: { type: ['string', 'null'], maxLength: 255 },
        content: { type: ['string', 'null'] },
        is_verified: { type: 'boolean' },
      },
    };
  }
}
