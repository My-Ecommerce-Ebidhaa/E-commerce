import { BaseModel } from './Base.model';

export interface DefaultBranding {
  defaultPrimaryColor?: string;
  defaultSecondaryColor?: string;
  defaultAccentColor?: string;
  defaultGradientStart?: string;
  defaultGradientEnd?: string;
}

export class PlatformSettings extends BaseModel {
  static tableName = 'platform_settings';

  // Default Payment Provider Configuration
  default_payment_provider?: string;
  default_payment_credentials?: string; // Encrypted JSON
  default_payment_settings!: Record<string, unknown>;

  // Default Email Provider Configuration
  default_email_provider?: string;
  default_email_credentials?: string; // Encrypted JSON
  default_email_settings!: Record<string, unknown>;

  // Default SMS Provider Configuration
  default_sms_provider?: string;
  default_sms_credentials?: string; // Encrypted JSON
  default_sms_settings!: Record<string, unknown>;

  // Platform branding defaults
  default_branding!: DefaultBranding;

  // Platform contact info
  support_email?: string;
  support_phone?: string;

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        default_payment_provider: { type: ['string', 'null'] },
        default_payment_credentials: { type: ['string', 'null'] },
        default_payment_settings: { type: 'object' },
        default_email_provider: { type: ['string', 'null'] },
        default_email_credentials: { type: ['string', 'null'] },
        default_email_settings: { type: 'object' },
        default_sms_provider: { type: ['string', 'null'] },
        default_sms_credentials: { type: ['string', 'null'] },
        default_sms_settings: { type: 'object' },
        default_branding: { type: 'object' },
        support_email: { type: ['string', 'null'] },
        support_phone: { type: ['string', 'null'] },
      },
    };
  }
}
