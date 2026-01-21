import { injectable, inject } from 'tsyringe';
import { createHash } from 'crypto';
import { IdempotencyRepository } from '@/repositories/idempotency.repo';
import { RedisService } from './redis.service';
import { AppError } from '@/shared/errors/app.error';
import { config } from '@/config';
import httpStatus from 'http-status';

export interface IdempotencyCheckResult {
  isNew: boolean;
  recordId?: string;
  cachedResponse?: {
    data: Record<string, unknown>;
    status: number;
  };
}

@injectable()
export class IdempotencyService {
  private readonly expiryMinutes: number;

  constructor(
    @inject('IdempotencyRepository')
    private idempotencyRepo: IdempotencyRepository,
    @inject('RedisService')
    private redis: RedisService
  ) {
    this.expiryMinutes = config.idempotency.expiryMinutes;
  }

  async check(params: {
    tenantId: string;
    idempotencyKey: string;
    requestType: string;
    requestPath: string;
    requestMethod: string;
    requestBody: Record<string, unknown>;
    expiryMinutes?: number;
  }): Promise<IdempotencyCheckResult> {
    const {
      tenantId,
      idempotencyKey,
      requestType,
      requestPath,
      requestMethod,
      requestBody,
      expiryMinutes = this.expiryMinutes,
    } = params;

    const requestHash = this.hashRequestBody(requestBody);
    const redisKey = `idempotency:${tenantId}:${idempotencyKey}`;

    // Quick check if currently processing
    const processingLock = await this.redis.get(redisKey);
    if (processingLock) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Request is currently being processed. Please wait.',
        'REQUEST_IN_PROGRESS'
      );
    }

    // Check database for existing record
    const existingRecord = await this.idempotencyRepo.findByKey(
      tenantId,
      idempotencyKey
    );

    if (existingRecord) {
      // Validate request body matches
      if (existingRecord.request_hash.hash !== requestHash.hash) {
        throw new AppError(
          httpStatus.UNPROCESSABLE_ENTITY,
          'Idempotency key already used with different request parameters',
          'IDEMPOTENCY_KEY_REUSED'
        );
      }

      await this.idempotencyRepo.incrementAttempts(existingRecord.id);

      if (
        existingRecord.status === 'completed' &&
        existingRecord.response_data
      ) {
        return {
          isNew: false,
          recordId: existingRecord.id,
          cachedResponse: {
            data: existingRecord.response_data,
            status: existingRecord.response_status || 200,
          },
        };
      }

      if (existingRecord.status === 'processing') {
        throw new AppError(
          httpStatus.CONFLICT,
          'Request is currently being processed',
          'REQUEST_IN_PROGRESS'
        );
      }

      // Status is 'failed' - allow retry
    }

    // Set Redis lock for processing
    await this.redis.set(redisKey, 'processing', expiryMinutes * 60);

    // Create or update record
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    let recordId: string;
    if (existingRecord) {
      await this.idempotencyRepo.update(existingRecord.id, {
        status: 'processing',
      } as any);
      recordId = existingRecord.id;
    } else {
      const record = await this.idempotencyRepo.createRecord({
        tenantId,
        idempotencyKey,
        requestType,
        requestPath,
        requestMethod,
        requestHash,
        expiresAt,
      });
      recordId = record.id;
    }

    return { isNew: true, recordId };
  }

  async complete(
    tenantId: string,
    idempotencyKey: string,
    recordId: string,
    responseData: Record<string, unknown>,
    responseStatus: number
  ): Promise<void> {
    await this.idempotencyRepo.markCompleted(
      recordId,
      responseData,
      responseStatus
    );

    const redisKey = `idempotency:${tenantId}:${idempotencyKey}`;
    await this.redis.del(redisKey);
  }

  async fail(
    tenantId: string,
    idempotencyKey: string,
    recordId: string
  ): Promise<void> {
    await this.idempotencyRepo.markFailed(recordId);

    const redisKey = `idempotency:${tenantId}:${idempotencyKey}`;
    await this.redis.del(redisKey);
  }

  private hashRequestBody(body: Record<string, unknown>): { hash: string } {
    const hash = createHash('sha256')
      .update(JSON.stringify(body))
      .digest('hex');
    return { hash };
  }
}
