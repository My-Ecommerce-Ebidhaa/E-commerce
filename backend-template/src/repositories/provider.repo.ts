import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repo';
import {
  TenantPaymentProvider,
  TenantEmailProvider,
  TenantSmsProvider,
} from '@/models/Provider.model';

@injectable()
export class PaymentProviderRepository extends BaseRepository<TenantPaymentProvider> {
  constructor() {
    super(TenantPaymentProvider);
  }

  async findByTenant(tenantId: string): Promise<TenantPaymentProvider[]> {
    return TenantPaymentProvider.query()
      .where('tenant_id', tenantId)
      .orderBy('is_default', 'desc')
      .orderBy('created_at', 'asc');
  }

  async findActiveByTenant(tenantId: string): Promise<TenantPaymentProvider[]> {
    return TenantPaymentProvider.query()
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .orderBy('is_default', 'desc');
  }

  async findDefaultByTenant(tenantId: string): Promise<TenantPaymentProvider | undefined> {
    return TenantPaymentProvider.query()
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .where('is_default', true)
      .first();
  }

  async findByProvider(
    tenantId: string,
    provider: string
  ): Promise<TenantPaymentProvider | undefined> {
    return TenantPaymentProvider.query()
      .where('tenant_id', tenantId)
      .where('provider', provider)
      .first();
  }

  async setDefault(tenantId: string, id: string): Promise<void> {
    // Unset all defaults
    await TenantPaymentProvider.query()
      .where('tenant_id', tenantId)
      .patch({ is_default: false });

    // Set the new default
    await TenantPaymentProvider.query()
      .where('id', id)
      .patch({ is_default: true });
  }
}

@injectable()
export class EmailProviderRepository extends BaseRepository<TenantEmailProvider> {
  constructor() {
    super(TenantEmailProvider);
  }

  async findByTenant(tenantId: string): Promise<TenantEmailProvider[]> {
    return TenantEmailProvider.query()
      .where('tenant_id', tenantId)
      .orderBy('is_active', 'desc')
      .orderBy('created_at', 'asc');
  }

  async findActiveByTenant(tenantId: string): Promise<TenantEmailProvider | undefined> {
    return TenantEmailProvider.query()
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .first();
  }

  async findByProvider(
    tenantId: string,
    provider: string
  ): Promise<TenantEmailProvider | undefined> {
    return TenantEmailProvider.query()
      .where('tenant_id', tenantId)
      .where('provider', provider)
      .first();
  }
}

@injectable()
export class SmsProviderRepository extends BaseRepository<TenantSmsProvider> {
  constructor() {
    super(TenantSmsProvider);
  }

  async findByTenant(tenantId: string): Promise<TenantSmsProvider[]> {
    return TenantSmsProvider.query()
      .where('tenant_id', tenantId)
      .orderBy('is_active', 'desc')
      .orderBy('created_at', 'asc');
  }

  async findActiveByTenant(tenantId: string): Promise<TenantSmsProvider | undefined> {
    return TenantSmsProvider.query()
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .first();
  }

  async findByProvider(
    tenantId: string,
    provider: string
  ): Promise<TenantSmsProvider | undefined> {
    return TenantSmsProvider.query()
      .where('tenant_id', tenantId)
      .where('provider', provider)
      .first();
  }
}
