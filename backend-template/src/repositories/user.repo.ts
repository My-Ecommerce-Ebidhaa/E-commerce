import { injectable } from 'tsyringe';
import { BaseRepository, QueryOptions } from './base.repo';
import { User } from '@/models/User.model';
import { PaginatedResult } from '@/shared/utils/response.util';

@injectable()
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(tenantId: string, email: string): Promise<User | undefined> {
    return User.query()
      .where('tenant_id', tenantId)
      .where('email', email.toLowerCase())
      .first();
  }

  async findByTenant(
    tenantId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<User>> {
    return this.paginate({ tenant_id: tenantId } as Partial<User>, options);
  }

  async findByResetToken(token: string): Promise<User | undefined> {
    return User.query()
      .where('reset_token', token)
      .where('reset_token_expires_at', '>', new Date())
      .first();
  }

  async emailExists(
    tenantId: string,
    email: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = User.query()
      .where('tenant_id', tenantId)
      .where('email', email.toLowerCase());

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const count = await query.resultSize();
    return count > 0;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await User.query().patchAndFetchById(userId, {
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expires_at: null,
    });
  }

  async setResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await User.query().patchAndFetchById(userId, {
      reset_token: token,
      reset_token_expires_at: expiresAt,
    });
  }

  async verifyEmail(userId: string): Promise<void> {
    await User.query().patchAndFetchById(userId, {
      email_verified: true,
    });
  }
}
