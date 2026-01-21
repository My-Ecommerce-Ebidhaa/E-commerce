import { injectable, inject } from 'tsyringe';
import {
  PaymentProviderRepository,
  EmailProviderRepository,
  SmsProviderRepository,
} from '@/repositories/provider.repo';
import {
  TenantPaymentProvider,
  TenantEmailProvider,
  TenantSmsProvider,
} from '@/models/Provider.model';
import {
  ProviderFactory,
  SUPPORTED_PROVIDERS,
  ProviderType,
  ProviderDefinition,
} from '@/shared/providers/provider.factory';
import { IPaymentProvider } from '@/shared/providers/payment/payment.interface';
import { IEmailProvider } from '@/shared/providers/email/email.interface';
import { ISmsProvider } from '@/shared/providers/sms/sms.interface';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '@/shared/errors/app.error';
import {
  ConfigurePaymentProviderDto,
  UpdatePaymentProviderDto,
  ConfigureEmailProviderDto,
  UpdateEmailProviderDto,
  ConfigureSmsProviderDto,
  UpdateSmsProviderDto,
} from './dto/provider.dto';

@injectable()
export class ProviderService {
  constructor(
    @inject('PaymentProviderRepository')
    private paymentProviderRepo: PaymentProviderRepository,
    @inject('EmailProviderRepository')
    private emailProviderRepo: EmailProviderRepository,
    @inject('SmsProviderRepository')
    private smsProviderRepo: SmsProviderRepository
  ) {}

  /**
   * Get all supported providers
   */
  getSupportedProviders(type?: ProviderType): ProviderDefinition[] {
    if (type) {
      return ProviderFactory.getProvidersByType(type);
    }
    return SUPPORTED_PROVIDERS;
  }

  /**
   * Get provider definition
   */
  getProviderDefinition(name: string): ProviderDefinition | undefined {
    return ProviderFactory.getProviderDefinition(name);
  }

  // ==================== PAYMENT PROVIDERS ====================

  async getPaymentProviders(tenantId: string): Promise<TenantPaymentProvider[]> {
    return this.paymentProviderRepo.findByTenant(tenantId);
  }

  async getPaymentProvider(
    tenantId: string,
    id: string
  ): Promise<TenantPaymentProvider> {
    const provider = await this.paymentProviderRepo.findById(id);
    if (!provider || provider.tenant_id !== tenantId) {
      throw new NotFoundError('Payment provider not found', 'PROVIDER_NOT_FOUND');
    }
    return provider;
  }

  async configurePaymentProvider(
    tenantId: string,
    dto: ConfigurePaymentProviderDto
  ): Promise<TenantPaymentProvider> {
    // Validate provider is supported
    const definition = ProviderFactory.getProviderDefinition(dto.provider);
    if (!definition || definition.type !== 'payment') {
      throw new BadRequestError(
        'Unsupported payment provider',
        'UNSUPPORTED_PROVIDER'
      );
    }

    // Validate credentials
    const validation = ProviderFactory.validateCredentials(
      dto.provider,
      dto.credentials
    );
    if (!validation.valid) {
      throw new BadRequestError(
        `Missing required credentials: ${validation.missing.join(', ')}`,
        'MISSING_CREDENTIALS'
      );
    }

    // Check if provider already configured
    const existing = await this.paymentProviderRepo.findByProvider(
      tenantId,
      dto.provider
    );
    if (existing) {
      throw new ConflictError(
        'Payment provider already configured',
        'PROVIDER_EXISTS'
      );
    }

    // Encrypt credentials
    const encryptedCredentials = ProviderFactory.encryptCredentials(
      dto.credentials
    );

    // Check if this is the first provider (make it default)
    const existingProviders = await this.paymentProviderRepo.findByTenant(tenantId);
    const isDefault = dto.isDefault ?? existingProviders.length === 0;

    // If setting as default, unset others
    if (isDefault && existingProviders.length > 0) {
      await this.paymentProviderRepo.updateWhere(
        { tenant_id: tenantId } as Partial<TenantPaymentProvider>,
        { is_default: false } as Partial<TenantPaymentProvider>
      );
    }

    return this.paymentProviderRepo.create({
      tenant_id: tenantId,
      provider: dto.provider,
      is_active: dto.isActive ?? true,
      is_default: isDefault,
      credentials: encryptedCredentials,
      settings: dto.settings || {},
    } as Partial<TenantPaymentProvider>);
  }

  async updatePaymentProvider(
    tenantId: string,
    id: string,
    dto: UpdatePaymentProviderDto
  ): Promise<TenantPaymentProvider> {
    const provider = await this.getPaymentProvider(tenantId, id);

    const updateData: Partial<TenantPaymentProvider> = {};

    if (dto.credentials) {
      // Merge with existing credentials
      const existingCredentials = ProviderFactory.decryptCredentials(
        provider.credentials
      );
      const mergedCredentials = { ...existingCredentials, ...dto.credentials };
      updateData.credentials = ProviderFactory.encryptCredentials(
        mergedCredentials
      );
    }

    if (dto.settings !== undefined) {
      updateData.settings = { ...provider.settings, ...dto.settings };
    }

    if (dto.isActive !== undefined) {
      updateData.is_active = dto.isActive;
    }

    if (dto.isDefault === true) {
      await this.paymentProviderRepo.setDefault(tenantId, id);
    }

    if (Object.keys(updateData).length > 0) {
      await this.paymentProviderRepo.update(id, updateData);
    }

    return this.getPaymentProvider(tenantId, id);
  }

  async deletePaymentProvider(tenantId: string, id: string): Promise<void> {
    await this.getPaymentProvider(tenantId, id);
    await this.paymentProviderRepo.delete(id);
  }

  async getPaymentProviderInstance(tenantId: string): Promise<IPaymentProvider> {
    const provider = await this.paymentProviderRepo.findDefaultByTenant(tenantId);
    if (!provider) {
      throw new NotFoundError(
        'No active payment provider configured',
        'NO_PAYMENT_PROVIDER'
      );
    }

    return ProviderFactory.createPaymentProvider(
      provider.provider,
      provider.credentials,
      provider.settings
    );
  }

  // ==================== EMAIL PROVIDERS ====================

  async getEmailProviders(tenantId: string): Promise<TenantEmailProvider[]> {
    return this.emailProviderRepo.findByTenant(tenantId);
  }

  async getEmailProvider(
    tenantId: string,
    id: string
  ): Promise<TenantEmailProvider> {
    const provider = await this.emailProviderRepo.findById(id);
    if (!provider || provider.tenant_id !== tenantId) {
      throw new NotFoundError('Email provider not found', 'PROVIDER_NOT_FOUND');
    }
    return provider;
  }

  async configureEmailProvider(
    tenantId: string,
    dto: ConfigureEmailProviderDto
  ): Promise<TenantEmailProvider> {
    const definition = ProviderFactory.getProviderDefinition(dto.provider);
    if (!definition || definition.type !== 'email') {
      throw new BadRequestError(
        'Unsupported email provider',
        'UNSUPPORTED_PROVIDER'
      );
    }

    const validation = ProviderFactory.validateCredentials(
      dto.provider,
      dto.credentials
    );
    if (!validation.valid) {
      throw new BadRequestError(
        `Missing required credentials: ${validation.missing.join(', ')}`,
        'MISSING_CREDENTIALS'
      );
    }

    const existing = await this.emailProviderRepo.findByProvider(
      tenantId,
      dto.provider
    );
    if (existing) {
      throw new ConflictError(
        'Email provider already configured',
        'PROVIDER_EXISTS'
      );
    }

    const encryptedCredentials = ProviderFactory.encryptCredentials(
      dto.credentials
    );

    // Deactivate other providers if this one is active
    if (dto.isActive) {
      await this.emailProviderRepo.updateWhere(
        { tenant_id: tenantId } as Partial<TenantEmailProvider>,
        { is_active: false } as Partial<TenantEmailProvider>
      );
    }

    return this.emailProviderRepo.create({
      tenant_id: tenantId,
      provider: dto.provider,
      is_active: dto.isActive ?? true,
      credentials: encryptedCredentials,
      settings: dto.settings || {},
    } as Partial<TenantEmailProvider>);
  }

  async updateEmailProvider(
    tenantId: string,
    id: string,
    dto: UpdateEmailProviderDto
  ): Promise<TenantEmailProvider> {
    const provider = await this.getEmailProvider(tenantId, id);

    const updateData: Partial<TenantEmailProvider> = {};

    if (dto.credentials) {
      const existingCredentials = ProviderFactory.decryptCredentials(
        provider.credentials
      );
      const mergedCredentials = { ...existingCredentials, ...dto.credentials };
      updateData.credentials = ProviderFactory.encryptCredentials(
        mergedCredentials
      );
    }

    if (dto.settings !== undefined) {
      updateData.settings = { ...provider.settings, ...dto.settings };
    }

    if (dto.isActive !== undefined) {
      // If activating, deactivate others
      if (dto.isActive) {
        await this.emailProviderRepo.updateWhere(
          { tenant_id: tenantId } as Partial<TenantEmailProvider>,
          { is_active: false } as Partial<TenantEmailProvider>
        );
      }
      updateData.is_active = dto.isActive;
    }

    if (Object.keys(updateData).length > 0) {
      await this.emailProviderRepo.update(id, updateData);
    }

    return this.getEmailProvider(tenantId, id);
  }

  async deleteEmailProvider(tenantId: string, id: string): Promise<void> {
    await this.getEmailProvider(tenantId, id);
    await this.emailProviderRepo.delete(id);
  }

  async getEmailProviderInstance(tenantId: string): Promise<IEmailProvider> {
    const provider = await this.emailProviderRepo.findActiveByTenant(tenantId);
    if (!provider) {
      throw new NotFoundError(
        'No active email provider configured',
        'NO_EMAIL_PROVIDER'
      );
    }

    return ProviderFactory.createEmailProvider(
      provider.provider,
      provider.credentials,
      provider.settings
    );
  }

  // ==================== SMS PROVIDERS ====================

  async getSmsProviders(tenantId: string): Promise<TenantSmsProvider[]> {
    return this.smsProviderRepo.findByTenant(tenantId);
  }

  async getSmsProvider(
    tenantId: string,
    id: string
  ): Promise<TenantSmsProvider> {
    const provider = await this.smsProviderRepo.findById(id);
    if (!provider || provider.tenant_id !== tenantId) {
      throw new NotFoundError('SMS provider not found', 'PROVIDER_NOT_FOUND');
    }
    return provider;
  }

  async configureSmsProvider(
    tenantId: string,
    dto: ConfigureSmsProviderDto
  ): Promise<TenantSmsProvider> {
    const definition = ProviderFactory.getProviderDefinition(dto.provider);
    if (!definition || definition.type !== 'sms') {
      throw new BadRequestError(
        'Unsupported SMS provider',
        'UNSUPPORTED_PROVIDER'
      );
    }

    const validation = ProviderFactory.validateCredentials(
      dto.provider,
      dto.credentials
    );
    if (!validation.valid) {
      throw new BadRequestError(
        `Missing required credentials: ${validation.missing.join(', ')}`,
        'MISSING_CREDENTIALS'
      );
    }

    const existing = await this.smsProviderRepo.findByProvider(
      tenantId,
      dto.provider
    );
    if (existing) {
      throw new ConflictError(
        'SMS provider already configured',
        'PROVIDER_EXISTS'
      );
    }

    const encryptedCredentials = ProviderFactory.encryptCredentials(
      dto.credentials
    );

    if (dto.isActive) {
      await this.smsProviderRepo.updateWhere(
        { tenant_id: tenantId } as Partial<TenantSmsProvider>,
        { is_active: false } as Partial<TenantSmsProvider>
      );
    }

    return this.smsProviderRepo.create({
      tenant_id: tenantId,
      provider: dto.provider,
      is_active: dto.isActive ?? true,
      credentials: encryptedCredentials,
      settings: dto.settings || {},
    } as Partial<TenantSmsProvider>);
  }

  async updateSmsProvider(
    tenantId: string,
    id: string,
    dto: UpdateSmsProviderDto
  ): Promise<TenantSmsProvider> {
    const provider = await this.getSmsProvider(tenantId, id);

    const updateData: Partial<TenantSmsProvider> = {};

    if (dto.credentials) {
      const existingCredentials = ProviderFactory.decryptCredentials(
        provider.credentials
      );
      const mergedCredentials = { ...existingCredentials, ...dto.credentials };
      updateData.credentials = ProviderFactory.encryptCredentials(
        mergedCredentials
      );
    }

    if (dto.settings !== undefined) {
      updateData.settings = { ...provider.settings, ...dto.settings };
    }

    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        await this.smsProviderRepo.updateWhere(
          { tenant_id: tenantId } as Partial<TenantSmsProvider>,
          { is_active: false } as Partial<TenantSmsProvider>
        );
      }
      updateData.is_active = dto.isActive;
    }

    if (Object.keys(updateData).length > 0) {
      await this.smsProviderRepo.update(id, updateData);
    }

    return this.getSmsProvider(tenantId, id);
  }

  async deleteSmsProvider(tenantId: string, id: string): Promise<void> {
    await this.getSmsProvider(tenantId, id);
    await this.smsProviderRepo.delete(id);
  }

  async getSmsProviderInstance(tenantId: string): Promise<ISmsProvider> {
    const provider = await this.smsProviderRepo.findActiveByTenant(tenantId);
    if (!provider) {
      throw new NotFoundError(
        'No active SMS provider configured',
        'NO_SMS_PROVIDER'
      );
    }

    return ProviderFactory.createSmsProvider(
      provider.provider,
      provider.credentials,
      provider.settings
    );
  }
}
