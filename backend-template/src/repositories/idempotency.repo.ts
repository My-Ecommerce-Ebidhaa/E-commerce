import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repo';
import { IdempotencyRecord } from '@/models/IdempotencyRecord.model';

@injectable()
export class IdempotencyRepository extends BaseRepository<IdempotencyRecord> {
  constructor() {
    super(IdempotencyRecord);
  }

  async findByKey(
    tenantId: string,
    key: string
  ): Promise<IdempotencyRecord | undefined> {
    return IdempotencyRecord.query()
      .where('tenant_id', tenantId)
      .where('idempotency_key', key)
      .where('expires_at', '>', new Date())
      .first();
  }

  async createRecord(data: {
    tenantId: string;
    idempotencyKey: string;
    requestType: string;
    requestPath: string;
    requestMethod: string;
    requestHash: { hash: string };
    expiresAt: Date;
  }): Promise<IdempotencyRecord> {
    return IdempotencyRecord.query().insert({
      tenant_id: data.tenantId,
      idempotency_key: data.idempotencyKey,
      request_type: data.requestType,
      request_path: data.requestPath,
      request_method: data.requestMethod,
      request_hash: data.requestHash,
      expires_at: data.expiresAt,
      status: 'processing',
      attempts: 1,
    });
  }

  async markCompleted(
    id: string,
    responseData: Record<string, unknown>,
    responseStatus: number
  ): Promise<void> {
    await IdempotencyRecord.query().patchAndFetchById(id, {
      status: 'completed',
      response_data: responseData,
      response_status: responseStatus,
    });
  }

  async markFailed(id: string): Promise<void> {
    await IdempotencyRecord.query().patchAndFetchById(id, {
      status: 'failed',
    });
  }

  async incrementAttempts(id: string): Promise<void> {
    await IdempotencyRecord.query().findById(id).increment('attempts', 1);
  }

  async cleanupExpired(): Promise<number> {
    return IdempotencyRecord.query()
      .where('expires_at', '<', new Date())
      .delete();
  }
}
