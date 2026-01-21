/**
 * SMS Provider Interface
 * Standardized interface for all SMS providers (Twilio, Termii, Africa's Talking)
 */

export interface SmsOptions {
  to: string | string[];
  message: string;
  from?: string; // Sender ID
  type?: 'plain' | 'unicode';
  reference?: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
}

export interface SmsSendResult {
  messageId: string;
  provider: string;
  status: 'sent' | 'queued' | 'failed';
  to: string;
  segments?: number;
  cost?: number;
  currency?: string;
  rawResponse?: any;
}

export interface BulkSmsOptions {
  messages: Array<{
    to: string;
    message: string;
    reference?: string;
  }>;
  from?: string;
  type?: 'plain' | 'unicode';
}

export interface BulkSmsResult {
  totalSent: number;
  totalFailed: number;
  totalCost?: number;
  currency?: string;
  results: Array<{
    to: string;
    messageId?: string;
    status: 'sent' | 'failed';
    error?: string;
  }>;
}

export interface OtpOptions {
  to: string;
  from?: string;
  length?: number;
  expiresInMinutes?: number;
  channel?: 'sms' | 'voice' | 'whatsapp';
  messageTemplate?: string; // Use {otp} as placeholder
}

export interface OtpSendResult {
  pinId: string;
  to: string;
  status: 'sent' | 'failed';
  expiresAt?: Date;
}

export interface OtpVerifyResult {
  valid: boolean;
  pinId: string;
  attemptsRemaining?: number;
}

export interface ISmsProvider {
  readonly name: string;
  readonly supportedFeatures: SmsFeature[];
  readonly supportedCountries?: string[];

  /**
   * Send a single SMS
   */
  sendSms(options: SmsOptions): Promise<SmsSendResult>;

  /**
   * Send bulk SMS
   */
  sendBulkSms?(options: BulkSmsOptions): Promise<BulkSmsResult>;

  /**
   * Send OTP
   */
  sendOtp?(options: OtpOptions): Promise<OtpSendResult>;

  /**
   * Verify OTP
   */
  verifyOtp?(pinId: string, otp: string): Promise<OtpVerifyResult>;

  /**
   * Get SMS delivery status
   */
  getSmsStatus?(messageId: string): Promise<{
    status: 'delivered' | 'sent' | 'failed' | 'rejected' | 'pending';
    deliveredAt?: Date;
    error?: string;
  }>;

  /**
   * Get account balance
   */
  getBalance?(): Promise<{
    balance: number;
    currency: string;
  }>;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature?(payload: string, signature: string): boolean;
}

export enum SmsFeature {
  BULK_SMS = 'bulk_sms',
  OTP = 'otp',
  DELIVERY_REPORTS = 'delivery_reports',
  SCHEDULING = 'scheduling',
  UNICODE = 'unicode',
  VOICE = 'voice',
  WHATSAPP = 'whatsapp',
}

export interface SmsProviderConfig {
  apiKey: string;
  apiSecret?: string;
  senderId?: string;
  accountId?: string;
  baseUrl?: string;
  webhookUrl?: string;
  [key: string]: any;
}
