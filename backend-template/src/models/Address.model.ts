import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';

export class Address extends BaseModel {
  static tableName = 'addresses';

  user_id!: string;
  label?: string;
  first_name!: string;
  last_name!: string;
  company?: string;
  address_1!: string;
  address_2?: string;
  city!: string;
  state!: string;
  postal_code!: string;
  country!: string;
  phone?: string;
  is_default!: boolean;

  // Relations
  user?: Model;

  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  get fullAddress(): string {
    const parts = [
      this.address_1,
      this.address_2,
      this.city,
      this.state,
      this.postal_code,
      this.country,
    ].filter(Boolean);
    return parts.join(', ');
  }

  static get relationMappings(): RelationMappings {
    const { User } = require('./User.model');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'addresses.user_id',
          to: 'users.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'first_name', 'last_name', 'address_1', 'city', 'state', 'postal_code', 'country'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        label: { type: ['string', 'null'], maxLength: 50 },
        first_name: { type: 'string', minLength: 1, maxLength: 100 },
        last_name: { type: 'string', minLength: 1, maxLength: 100 },
        company: { type: ['string', 'null'], maxLength: 255 },
        address_1: { type: 'string', minLength: 1, maxLength: 255 },
        address_2: { type: ['string', 'null'], maxLength: 255 },
        city: { type: 'string', minLength: 1, maxLength: 100 },
        state: { type: 'string', minLength: 1, maxLength: 100 },
        postal_code: { type: 'string', minLength: 1, maxLength: 20 },
        country: { type: 'string', minLength: 2, maxLength: 2 },
        phone: { type: ['string', 'null'], maxLength: 20 },
        is_default: { type: 'boolean' },
      },
    };
  }
}
