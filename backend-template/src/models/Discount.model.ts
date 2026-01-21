import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';
import { DiscountType } from '@/shared/enums/generic.enum';

export class Discount extends BaseModel {
  static tableName = 'discounts';

  tenant_id!: string;
  code!: string;
  type!: DiscountType;
  value!: number;
  min_purchase?: number;
  max_uses?: number;
  used_count!: number;
  starts_at!: Date;
  ends_at?: Date;
  is_active!: boolean;

  // Relations
  tenant?: Model;

  get isValid(): boolean {
    const now = new Date();

    if (!this.is_active) return false;
    if (this.starts_at > now) return false;
    if (this.ends_at && this.ends_at < now) return false;
    if (this.max_uses && this.used_count >= this.max_uses) return false;

    return true;
  }

  static get relationMappings(): RelationMappings {
    const { Tenant } = require('./Tenant.model');

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'discounts.tenant_id',
          to: 'tenants.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tenant_id', 'code', 'type', 'value', 'starts_at'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        tenant_id: { type: 'string', format: 'uuid' },
        code: { type: 'string', minLength: 1, maxLength: 50 },
        type: { type: 'string', enum: Object.values(DiscountType) },
        value: { type: 'number', minimum: 0 },
        min_purchase: { type: ['number', 'null'], minimum: 0 },
        max_uses: { type: ['integer', 'null'], minimum: 1 },
        used_count: { type: 'integer', minimum: 0 },
        starts_at: { type: 'string', format: 'date-time' },
        ends_at: { type: ['string', 'null'], format: 'date-time' },
        is_active: { type: 'boolean' },
      },
    };
  }
}
