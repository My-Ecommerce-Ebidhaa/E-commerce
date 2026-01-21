/**
 * Provider Factory
 * Factory pattern for instantiating providers based on tenant configuration
 */

import { config } from '@/config';
import { CredentialsEncryption } from './base.provider';

// Payment Providers
import { IPaymentProvider, PaymentProviderConfig } from './payment/payment.interface';
import { PaystackAdapter } from './payment/paystack.adapter';
import { StripeAdapter } from './payment/stripe.adapter';

// Email Providers
import { IEmailProvider, EmailProviderConfig } from './email/email.interface';
import { SendGridAdapter } from './email/sendgrid.adapter';
import { SmtpAdapter } from './email/smtp.adapter';

// SMS Providers
import { ISmsProvider, SmsProviderConfig } from './sms/sms.interface';
import { TwilioAdapter } from './sms/twilio.adapter';
import { TermiiAdapter } from './sms/termii.adapter';

export type ProviderType = 'payment' | 'email' | 'sms';

export interface ProviderDefinition {
  name: string;
  displayName: string;
  type: ProviderType;
  requiredCredentials: string[];
  optionalCredentials?: string[];
  supportedFeatures?: string[];
}

export const SUPPORTED_PROVIDERS: ProviderDefinition[] = [
  // Payment Providers
  {
    name: 'paystack',
    displayName: 'Paystack',
    type: 'payment',
    requiredCredentials: ['secretKey', 'publicKey'],
    optionalCredentials: ['webhookSecret'],
    supportedFeatures: [
      'card_payments',
      'bank_transfer',
      'ussd',
      'recurring_payments',
      'transfers',
      'refunds',
      'virtual_accounts',
    ],
  },
  {
    name: 'stripe',
    displayName: 'Stripe',
    type: 'payment',
    requiredCredentials: ['secretKey'],
    optionalCredentials: ['webhookSecret', 'publishableKey'],
    supportedFeatures: [
      'card_payments',
      'recurring_payments',
      'transfers',
      'refunds',
    ],
  },
  // Email Providers
  {
    name: 'sendgrid',
    displayName: 'SendGrid',
    type: 'email',
    requiredCredentials: ['apiKey'],
    optionalCredentials: ['fromEmail', 'fromName'],
    supportedFeatures: [
      'templates',
      'bulk_send',
      'tracking',
      'attachments',
      'scheduling',
    ],
  },
  {
    name: 'smtp',
    displayName: 'SMTP',
    type: 'email',
    requiredCredentials: ['host', 'port'],
    optionalCredentials: ['username', 'password', 'secure', 'fromEmail', 'fromName'],
    supportedFeatures: ['attachments'],
  },
  // SMS Providers
  {
    name: 'twilio',
    displayName: 'Twilio',
    type: 'sms',
    requiredCredentials: ['accountSid', 'authToken'],
    optionalCredentials: ['senderId', 'verifyServiceSid'],
    supportedFeatures: ['bulk_sms', 'otp', 'delivery_reports', 'voice', 'whatsapp'],
  },
  {
    name: 'termii',
    displayName: 'Termii',
    type: 'sms',
    requiredCredentials: ['apiKey'],
    optionalCredentials: ['senderId'],
    supportedFeatures: ['bulk_sms', 'otp', 'delivery_reports', 'whatsapp'],
  },
];

export class ProviderFactory {
  private static encryptor: CredentialsEncryption;

  private static getEncryptor(): CredentialsEncryption {
    if (!this.encryptor) {
      const encryptionKey = config.security?.encryptionKey || config.jwt.secret;
      this.encryptor = new CredentialsEncryption(encryptionKey);
    }
    return this.encryptor;
  }

  /**
   * Encrypt credentials before storing in database
   */
  static encryptCredentials(credentials: Record<string, any>): string {
    return this.getEncryptor().encrypt(JSON.stringify(credentials));
  }

  /**
   * Decrypt credentials from database
   */
  static decryptCredentials(encryptedCredentials: string): Record<string, any> {
    return JSON.parse(this.getEncryptor().decrypt(encryptedCredentials));
  }

  /**
   * Get provider definition by name
   */
  static getProviderDefinition(name: string): ProviderDefinition | undefined {
    return SUPPORTED_PROVIDERS.find((p) => p.name === name);
  }

  /**
   * Get all providers of a specific type
   */
  static getProvidersByType(type: ProviderType): ProviderDefinition[] {
    return SUPPORTED_PROVIDERS.filter((p) => p.type === type);
  }

  /**
   * Create a payment provider instance
   */
  static createPaymentProvider(
    providerName: string,
    encryptedCredentials: string,
    settings: Record<string, any> = {}
  ): IPaymentProvider {
    const credentials = this.decryptCredentials(encryptedCredentials);
    const providerConfig: PaymentProviderConfig = {
      ...credentials,
      ...settings,
      environment: settings.environment || 'production',
    };

    switch (providerName.toLowerCase()) {
      case 'paystack':
        return new PaystackAdapter(providerConfig as any);

      case 'stripe':
        return new StripeAdapter(providerConfig as any);

      default:
        throw new Error(`Unsupported payment provider: ${providerName}`);
    }
  }

  /**
   * Create an email provider instance
   */
  static createEmailProvider(
    providerName: string,
    encryptedCredentials: string,
    settings: Record<string, any> = {}
  ): IEmailProvider {
    const credentials = this.decryptCredentials(encryptedCredentials);
    const providerConfig: EmailProviderConfig = {
      ...credentials,
      ...settings,
    };

    switch (providerName.toLowerCase()) {
      case 'sendgrid':
        return new SendGridAdapter({
          apiKey: providerConfig.apiKey,
          from: settings.fromEmail
            ? { email: settings.fromEmail, name: settings.fromName }
            : undefined,
        });

      case 'smtp':
        return new SmtpAdapter({
          host: providerConfig.host,
          port: parseInt(providerConfig.port),
          secure: providerConfig.secure === 'true' || providerConfig.secure === true,
          username: providerConfig.username,
          password: providerConfig.password,
          from: settings.fromEmail
            ? { email: settings.fromEmail, name: settings.fromName }
            : undefined,
        });

      default:
        throw new Error(`Unsupported email provider: ${providerName}`);
    }
  }

  /**
   * Create an SMS provider instance
   */
  static createSmsProvider(
    providerName: string,
    encryptedCredentials: string,
    settings: Record<string, any> = {}
  ): ISmsProvider {
    const credentials = this.decryptCredentials(encryptedCredentials);
    const providerConfig: SmsProviderConfig = {
      ...credentials,
      ...settings,
    };

    switch (providerName.toLowerCase()) {
      case 'twilio':
        return new TwilioAdapter({
          accountSid: providerConfig.accountSid,
          authToken: providerConfig.authToken,
          senderId: settings.senderId,
          verifyServiceSid: providerConfig.verifyServiceSid,
        });

      case 'termii':
        return new TermiiAdapter({
          apiKey: providerConfig.apiKey,
          senderId: settings.senderId,
        });

      default:
        throw new Error(`Unsupported SMS provider: ${providerName}`);
    }
  }

  /**
   * Validate provider credentials
   */
  static validateCredentials(
    providerName: string,
    credentials: Record<string, any>
  ): { valid: boolean; missing: string[] } {
    const definition = this.getProviderDefinition(providerName);

    if (!definition) {
      return { valid: false, missing: ['Unknown provider'] };
    }

    const missing = definition.requiredCredentials.filter(
      (key) => !credentials[key]
    );

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
