import { injectable, inject } from 'tsyringe';
import { PlatformSettingsRepository, ProviderType } from '@/repositories/platformSettings.repo';
import { PlatformSettings } from '@/models/PlatformSettings.model';
import { ProviderFactory, SUPPORTED_PROVIDERS } from '@/shared/providers/provider.factory';
import { NotFoundError, BadRequestError } from '@/shared/errors/app.error';
import {
  ConfigureDefaultProviderDto,
  UpdatePlatformSettingsDto,
} from './dto/platform-settings.dto';

@injectable()
export class PlatformSettingsService {
  constructor(
    @inject('PlatformSettingsRepository')
    private settingsRepo: PlatformSettingsRepository
  ) {}

  /**
   * Get platform settings
   */
  async getSettings(): Promise<PlatformSettings> {
    const settings = await this.settingsRepo.getSettings();
    if (!settings) {
      throw new NotFoundError('Platform settings not found', 'SETTINGS_NOT_FOUND');
    }
    return settings;
  }

  /**
   * Get platform settings with sanitized (masked) credentials
   */
  async getSanitizedSettings(): Promise<Record<string, unknown>> {
    const settings = await this.getSettings();

    return {
      id: settings.id,
      // Provider configurations (masked)
      defaultPaymentProvider: settings.default_payment_provider || null,
      defaultPaymentConfigured: !!settings.default_payment_credentials,
      defaultPaymentSettings: settings.default_payment_settings || {},

      defaultEmailProvider: settings.default_email_provider || null,
      defaultEmailConfigured: !!settings.default_email_credentials,
      defaultEmailSettings: settings.default_email_settings || {},

      defaultSmsProvider: settings.default_sms_provider || null,
      defaultSmsConfigured: !!settings.default_sms_credentials,
      defaultSmsSettings: settings.default_sms_settings || {},

      // Branding
      defaultBranding: settings.default_branding || {},

      // Support
      supportEmail: settings.support_email || null,
      supportPhone: settings.support_phone || null,

      createdAt: settings.created_at,
      updatedAt: settings.updated_at,
    };
  }

  /**
   * Update general platform settings
   */
  async updateSettings(dto: UpdatePlatformSettingsDto): Promise<PlatformSettings> {
    const updateData: Partial<PlatformSettings> = {};

    if (dto.defaultBranding) {
      const currentSettings = await this.settingsRepo.getSettings();
      updateData.default_branding = {
        ...(currentSettings?.default_branding || {}),
        ...dto.defaultBranding,
      };
    }

    if (dto.supportEmail !== undefined) {
      updateData.support_email = dto.supportEmail;
    }

    if (dto.supportPhone !== undefined) {
      updateData.support_phone = dto.supportPhone;
    }

    return this.settingsRepo.updateSettings(updateData);
  }

  /**
   * Configure default payment provider
   */
  async configureDefaultPaymentProvider(
    dto: ConfigureDefaultProviderDto
  ): Promise<PlatformSettings> {
    // Validate provider is supported
    const definition = ProviderFactory.getProviderDefinition(dto.provider);
    if (!definition || definition.type !== 'payment') {
      throw new BadRequestError(
        `Unsupported payment provider: ${dto.provider}`,
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

    // Encrypt credentials
    const encryptedCredentials = ProviderFactory.encryptCredentials(dto.credentials);

    return this.settingsRepo.configureDefaultPaymentProvider(
      dto.provider,
      encryptedCredentials,
      dto.settings
    );
  }

  /**
   * Configure default email provider
   */
  async configureDefaultEmailProvider(
    dto: ConfigureDefaultProviderDto
  ): Promise<PlatformSettings> {
    const definition = ProviderFactory.getProviderDefinition(dto.provider);
    if (!definition || definition.type !== 'email') {
      throw new BadRequestError(
        `Unsupported email provider: ${dto.provider}`,
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

    const encryptedCredentials = ProviderFactory.encryptCredentials(dto.credentials);

    return this.settingsRepo.configureDefaultEmailProvider(
      dto.provider,
      encryptedCredentials,
      dto.settings
    );
  }

  /**
   * Configure default SMS provider
   */
  async configureDefaultSmsProvider(
    dto: ConfigureDefaultProviderDto
  ): Promise<PlatformSettings> {
    const definition = ProviderFactory.getProviderDefinition(dto.provider);
    if (!definition || definition.type !== 'sms') {
      throw new BadRequestError(
        `Unsupported SMS provider: ${dto.provider}`,
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

    const encryptedCredentials = ProviderFactory.encryptCredentials(dto.credentials);

    return this.settingsRepo.configureDefaultSmsProvider(
      dto.provider,
      encryptedCredentials,
      dto.settings
    );
  }

  /**
   * Remove default provider
   */
  async removeDefaultProvider(type: ProviderType): Promise<PlatformSettings> {
    return this.settingsRepo.removeDefaultProvider(type);
  }

  /**
   * Get default provider configuration (for internal use - returns decrypted credentials)
   */
  async getDefaultProviderConfig(type: ProviderType): Promise<{
    provider: string;
    credentials: Record<string, unknown>;
    settings: Record<string, unknown>;
  } | null> {
    const settings = await this.settingsRepo.getSettings();
    if (!settings) return null;

    let provider: string | undefined;
    let encryptedCredentials: string | undefined;
    let providerSettings: Record<string, unknown> = {};

    switch (type) {
      case 'payment':
        provider = settings.default_payment_provider;
        encryptedCredentials = settings.default_payment_credentials;
        providerSettings = settings.default_payment_settings || {};
        break;
      case 'email':
        provider = settings.default_email_provider;
        encryptedCredentials = settings.default_email_credentials;
        providerSettings = settings.default_email_settings || {};
        break;
      case 'sms':
        provider = settings.default_sms_provider;
        encryptedCredentials = settings.default_sms_credentials;
        providerSettings = settings.default_sms_settings || {};
        break;
    }

    if (!provider || !encryptedCredentials) {
      return null;
    }

    const credentials = ProviderFactory.decryptCredentials(encryptedCredentials);

    return {
      provider,
      credentials,
      settings: providerSettings,
    };
  }

  /**
   * Check if a default provider is configured
   */
  async hasDefaultProvider(type: ProviderType): Promise<boolean> {
    return this.settingsRepo.hasDefaultProvider(type);
  }

  /**
   * Get list of supported providers
   */
  getSupportedProviders(type?: ProviderType) {
    if (type) {
      return SUPPORTED_PROVIDERS.filter((p) => p.type === type);
    }
    return SUPPORTED_PROVIDERS;
  }
}
