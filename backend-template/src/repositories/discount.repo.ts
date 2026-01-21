import { injectable } from 'tsyringe';
import { Transaction } from 'objection';
import { BaseRepository } from './base.repo';
import { Discount } from '@/models/Discount.model';

@injectable()
export class DiscountRepository extends BaseRepository<Discount> {
  constructor() {
    super(Discount);
  }

  async findByCode(tenantId: string, code: string): Promise<Discount | undefined> {
    return Discount.query()
      .where('tenant_id', tenantId)
      .where('code', code.toUpperCase())
      .first();
  }

  async findValidByCode(tenantId: string, code: string): Promise<Discount | undefined> {
    const now = new Date();

    return Discount.query()
      .where('tenant_id', tenantId)
      .where('code', code.toUpperCase())
      .where('is_active', true)
      .where('starts_at', '<=', now)
      .where((builder) => {
        builder.whereNull('ends_at').orWhere('ends_at', '>', now);
      })
      .where((builder) => {
        builder.whereNull('max_uses').orWhereRaw('used_count < max_uses');
      })
      .first();
  }

  async findByTenant(tenantId: string): Promise<Discount[]> {
    return Discount.query()
      .where('tenant_id', tenantId)
      .orderBy('created_at', 'desc');
  }

  async findActiveByTenant(tenantId: string): Promise<Discount[]> {
    const now = new Date();

    return Discount.query()
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .where('starts_at', '<=', now)
      .where((builder) => {
        builder.whereNull('ends_at').orWhere('ends_at', '>', now);
      })
      .orderBy('created_at', 'desc');
  }

  async codeExists(
    tenantId: string,
    code: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = Discount.query()
      .where('tenant_id', tenantId)
      .where('code', code.toUpperCase());

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const count = await query.resultSize();
    return count > 0;
  }

  async incrementUsedCount(discountId: string): Promise<void> {
    await Discount.query().findById(discountId).increment('used_count', 1);
  }

  async decrementUsedCount(discountId: string): Promise<void> {
    await Discount.query()
      .findById(discountId)
      .where('used_count', '>', 0)
      .decrement('used_count', 1);
  }

  async incrementUsage(
    tenantId: string,
    code: string,
    trx?: Transaction
  ): Promise<void> {
    let query = Discount.query();
    if (trx) {
      query = query.transacting(trx);
    }
    await query
      .where('tenant_id', tenantId)
      .where('code', code.toUpperCase())
      .increment('usage_count', 1);
  }
}
