import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repo';
import { PlatformSettings } from '@/models/PlatformSettings.model';

export type ProviderType = 'payment' | 'email' | 'sms';

@injectable()
export class PlatformSettingsRepository extends BaseRepository<PlatformSettings> {
  constructor() {
    super(PlatformSettings);
  }

  /**
   * Get the singleton platform settings record
   */
  async getSettings(): Promise<PlatformSettings | undefined> {
    return PlatformSettings.query().first();
  }

  /**
   * Update platform settings (upsert pattern for singleton)
   */
  async updateSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const existing = await this.getSettings();

    if (existing) {
      return this.update(existing.id, data);
    } else {
      return this.create(data);
    }
  }

  /**
   * Get default payment provider config
   */
  async getDefaultPaymentProvider(): Promise<{
    provider: string | null;
    credentials: string | null;
    settings: Record<string, unknown>;
  } | null> {
    const settings = await this.getSettings();
    if (!settings || !settings.default_payment_provider) {
      return null;
    }

    return {
      provider: settings.default_payment_provider,
      credentials: settings.default_payment_credentials || null,
      settings: settings.default_payment_settings || {},
    };
  }

  /**
   * Get default email provider config
   */
  async getDefaultEmailProvider(): Promise<{
    provider: string | null;
    credentials: string | null;
    settings: Record<string, unknown>;
  } | null> {
    const settings = await this.getSettings();
    if (!settings || !settings.default_email_provider) {
      return null;
    }

    return {
      provider: settings.default_email_provider,
      credentials: settings.default_email_credentials || null,
      settings: settings.default_email_settings || {},
    };
  }

  /**
   * Get default SMS provider config
   */
  async getDefaultSmsProvider(): Promise<{
    provider: string | null;
    credentials: string | null;
    settings: Record<string, unknown>;
  } | null> {
    const settings = await this.getSettings();
    if (!settings || !settings.default_sms_provider) {
      return null;
    }

    return {
      provider: settings.default_sms_provider,
      credentials: settings.default_sms_credentials || null,
      settings: settings.default_sms_settings || {},
    };
  }

  /**
   * Configure default payment provider
   */
  async configureDefaultPaymentProvider(
    provider: string,
    credentials: string,
    providerSettings?: Record<string, unknown>
  ): Promise<PlatformSettings> {
    return this.updateSettings({
      default_payment_provider: provider,
      default_payment_credentials: credentials,
      default_payment_settings: providerSettings || {},
    });
  }

  /**
   * Configure default email provider
   */
  async configureDefaultEmailProvider(
    provider: string,
    credentials: string,
    providerSettings?: Record<string, unknown>
  ): Promise<PlatformSettings> {
    return this.updateSettings({
      default_email_provider: provider,
      default_email_credentials: credentials,
      default_email_settings: providerSettings || {},
    });
  }

  /**
   * Configure default SMS provider
   */
  async configureDefaultSmsProvider(
    provider: string,
    credentials: string,
    providerSettings?: Record<string, unknown>
  ): Promise<PlatformSettings> {
    return this.updateSettings({
      default_sms_provider: provider,
      default_sms_credentials: credentials,
      default_sms_settings: providerSettings || {},
    });
  }

  /**
   * Remove default provider
   */
  async removeDefaultProvider(type: ProviderType): Promise<PlatformSettings> {
    const updateData: Partial<PlatformSettings> = {};

    switch (type) {
      case 'payment':
        updateData.default_payment_provider = undefined;
        updateData.default_payment_credentials = undefined;
        updateData.default_payment_settings = {};
        break;
      case 'email':
        updateData.default_email_provider = undefined;
        updateData.default_email_credentials = undefined;
        updateData.default_email_settings = {};
        break;
      case 'sms':
        updateData.default_sms_provider = undefined;
        updateData.default_sms_credentials = undefined;
        updateData.default_sms_settings = {};
        break;
    }

    return this.updateSettings(updateData);
  }

  /**
   * Check if a default provider is configured for a type
   */
  async hasDefaultProvider(type: ProviderType): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings) return false;

    switch (type) {
      case 'payment':
        return !!settings.default_payment_provider && !!settings.default_payment_credentials;
      case 'email':
        return !!settings.default_email_provider && !!settings.default_email_credentials;
      case 'sms':
        return !!settings.default_sms_provider && !!settings.default_sms_credentials;
      default:
        return false;
    }
  }
}
