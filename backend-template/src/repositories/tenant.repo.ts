import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repo';
import { Tenant } from '@/models/Tenant.model';

@injectable()
export class TenantRepository extends BaseRepository<Tenant> {
  constructor() {
    super(Tenant);
  }

  async findBySlug(slug: string): Promise<Tenant | undefined> {
    return this.findOne({ slug } as Partial<Tenant>);
  }

  async findByDomain(domain: string): Promise<Tenant | undefined> {
    return this.findOne({ custom_domain: domain } as Partial<Tenant>);
  }

  async findBySlugOrDomain(slugOrDomain: string): Promise<Tenant | undefined> {
    return Tenant.query()
      .where('slug', slugOrDomain)
      .orWhere('custom_domain', slugOrDomain)
      .first();
  }

  async findActive(): Promise<Tenant[]> {
    return Tenant.query().where('status', 'active');
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    let query = Tenant.query().where('slug', slug);

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const count = await query.resultSize();
    return count > 0;
  }

  async domainExists(domain: string, excludeId?: string): Promise<boolean> {
    let query = Tenant.query().where('custom_domain', domain);

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const count = await query.resultSize();
    return count > 0;
  }

  async updateSettings(
    tenantId: string,
    settings: Record<string, any>
  ): Promise<void> {
    const tenant = await this.findById(tenantId);
    if (!tenant) return;

    const mergedSettings = {
      ...(tenant.settings || {}),
      ...settings,
    };

    await Tenant.query()
      .patch({ settings: mergedSettings })
      .where('id', tenantId);
  }
}
