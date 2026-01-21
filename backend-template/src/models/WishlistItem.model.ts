import { Model, RelationMappings } from 'objection';

export class WishlistItem extends Model {
  static tableName = 'wishlist_items';

  id!: string;
  user_id!: string;
  product_id!: string;
  created_at!: Date;

  // Relations
  user?: Model;
  product?: Model;

  static get relationMappings(): RelationMappings {
    const { User } = require('./User.model');
    const { Product } = require('./Product.model');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'wishlist_items.user_id',
          to: 'users.id',
        },
      },
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: {
          from: 'wishlist_items.product_id',
          to: 'products.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'product_id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        product_id: { type: 'string', format: 'uuid' },
      },
    };
  }
}
