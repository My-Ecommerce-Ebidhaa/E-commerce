import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';
import { IdempotencyStatus } from '@/shared/enums/generic.enum';

export class IdempotencyRecord extends BaseModel {
  static tableName = 'idempotency_records';

  tenant_id!: string;
  idempotency_key!: string;
  request_type!: string;
  request_path?: string;
  request_method?: string;
  request_hash!: { hash: string };
  response_data?: Record<string, unknown>;
  response_status?: number;
  attempts!: number;
  status!: IdempotencyStatus;
  expires_at!: Date;

  // Relations
  tenant?: Model;

  static get relationMappings(): RelationMappings {
    const { Tenant } = require('./Tenant.model');

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'idempotency_records.tenant_id',
          to: 'tenants.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tenant_id', 'idempotency_key', 'request_type', 'request_hash', 'expires_at'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        tenant_id: { type: 'string', format: 'uuid' },
        idempotency_key: { type: 'string', maxLength: 255 },
        request_type: { type: 'string', maxLength: 50 },
        request_path: { type: ['string', 'null'], maxLength: 255 },
        request_method: { type: ['string', 'null'], maxLength: 10 },
        request_hash: { type: 'object' },
        response_data: { type: ['object', 'null'] },
        response_status: { type: ['integer', 'null'] },
        attempts: { type: 'integer', minimum: 1 },
        status: { type: 'string', enum: Object.values(IdempotencyStatus) },
        expires_at: { type: 'string', format: 'date-time' },
      },
    };
  }
}
