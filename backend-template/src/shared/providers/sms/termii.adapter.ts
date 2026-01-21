/**
 * Termii SMS Provider Adapter
 * Implements ISmsProvider interface for Termii (Nigeria-focused)
 */

import { BaseProvider } from '../base.provider';
import {
  ISmsProvider,
  SmsProviderConfig,
  SmsFeature,
  SmsOptions,
  SmsSendResult,
  BulkSmsOptions,
  BulkSmsResult,
  OtpOptions,
  OtpSendResult,
  OtpVerifyResult,
} from './sms.interface';

interface TermiiConfig extends SmsProviderConfig {
  apiKey: string;
  senderId?: string;
}

export class TermiiAdapter extends BaseProvider implements ISmsProvider {
  protected providerName = 'Termii';

  readonly name = 'termii';
  readonly supportedFeatures = [
    SmsFeature.BULK_SMS,
    SmsFeature.OTP,
    SmsFeature.DELIVERY_REPORTS,
    SmsFeature.UNICODE,
    SmsFeature.WHATSAPP,
  ];
  readonly supportedCountries = ['NG', 'GH', 'KE', 'ZA'];

  private readonly baseUrl = 'https://api.ng.termii.com/api';
  private readonly apiKey: string;
  private readonly defaultSenderId?: string;

  constructor(config: TermiiConfig) {
    super();
    this.apiKey = config.apiKey;
    this.defaultSenderId = config.senderId;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify({ ...data, api_key: this.apiKey }) : undefined,
    });

    const result = await response.json() as any;

    if (!response.ok || result.code?.startsWith('error')) {
      const error: any = new Error(result.message || 'Termii API error');
      error.statusCode = response.status;
      error.code = result.code;
      throw error;
    }

    return result;
  }

  async sendSms(options: SmsOptions): Promise<SmsSendResult> {
    return this.withRetry(async () => {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      const from = options.from || this.defaultSenderId;

      if (!from) {
        throw new Error('Sender ID (from) is required');
      }

      const response = await this.request<any>('POST', '/sms/send', {
        to: recipients.join(','),
        from,
        sms: options.message,
        type: options.type === 'unicode' ? 'unicode' : 'plain',
        channel: 'generic', // generic, whatsapp, dnd
      });

      return {
        messageId: response.message_id || response.request_id,
        provider: this.name,
        status: response.code === 'ok' ? 'sent' : 'failed',
        to: recipients[0],
        rawResponse: response,
      };
    }, 'sendSms');
  }

  async sendBulkSms(options: BulkSmsOptions): Promise<BulkSmsResult> {
    const results: BulkSmsResult['results'] = [];
    let totalSent = 0;
    let totalFailed = 0;

    // Group messages by content for efficiency
    const messageGroups = new Map<string, string[]>();
    for (const msg of options.messages) {
      const existing = messageGroups.get(msg.message) || [];
      existing.push(msg.to);
      messageGroups.set(msg.message, existing);
    }

    for (const [message, recipients] of messageGroups) {
      try {
        const response = await this.request<any>('POST', '/sms/send/bulk', {
          to: recipients,
          from: options.from || this.defaultSenderId,
          sms: message,
          type: options.type === 'unicode' ? 'unicode' : 'plain',
          channel: 'generic',
        });

        recipients.forEach((to) => {
          results.push({
            to,
            messageId: response.message_id,
            status: 'sent',
          });
        });
        totalSent += recipients.length;
      } catch (error: any) {
        recipients.forEach((to) => {
          results.push({
            to,
            status: 'failed',
            error: error.message,
          });
        });
        totalFailed += recipients.length;
      }
    }

    return {
      totalSent,
      totalFailed,
      results,
    };
  }

  async sendOtp(options: OtpOptions): Promise<OtpSendResult> {
    return this.withRetry(async () => {
      const messageType = options.channel === 'voice' ? 'VOICE' : 'NUMERIC';

      const response = await this.request<any>('POST', '/sms/otp/send', {
        to: options.to,
        from: options.from || this.defaultSenderId || 'Termii',
        message_type: messageType,
        pin_attempts: 3,
        pin_time_to_live: options.expiresInMinutes || 5,
        pin_length: options.length || 6,
        pin_placeholder: '{otp}',
        message_text:
          options.messageTemplate ||
          'Your verification code is {otp}. Valid for {pin_time_to_live} minutes.',
        channel: options.channel === 'whatsapp' ? 'whatsapp' : 'generic',
      });

      return {
        pinId: response.pinId,
        to: options.to,
        status: response.status === 'success' ? 'sent' : 'failed',
        expiresAt: new Date(
          Date.now() + (options.expiresInMinutes || 5) * 60 * 1000
        ),
      };
    }, 'sendOtp');
  }

  async verifyOtp(pinId: string, otp: string): Promise<OtpVerifyResult> {
    return this.withRetry(async () => {
      const response = await this.request<any>('POST', '/sms/otp/verify', {
        pin_id: pinId,
        pin: otp,
      });

      return {
        valid: response.verified === true || response.verified === 'true',
        pinId,
        attemptsRemaining: response.attemptsRemaining,
      };
    }, 'verifyOtp');
  }

  async getSmsStatus(messageId: string): Promise<{
    status: 'delivered' | 'sent' | 'failed' | 'rejected' | 'pending';
    deliveredAt?: Date;
    error?: string;
  }> {
    return this.withRetry(async () => {
      const response = await this.request<any>(
        'GET',
        `/sms/inbox?message_id=${messageId}`
      );

      const statusMap: Record<
        string,
        'delivered' | 'sent' | 'failed' | 'rejected' | 'pending'
      > = {
        Delivered: 'delivered',
        Sent: 'sent',
        Failed: 'failed',
        DND: 'rejected',
        Pending: 'pending',
      };

      return {
        status: statusMap[response.status] || 'pending',
        deliveredAt: response.date_created
          ? new Date(response.date_created)
          : undefined,
      };
    }, 'getSmsStatus');
  }

  async getBalance(): Promise<{ balance: number; currency: string }> {
    return this.withRetry(async () => {
      const response = await this.request<any>('GET', `/get-balance?api_key=${this.apiKey}`);

      return {
        balance: parseFloat(response.balance),
        currency: response.currency || 'NGN',
      };
    }, 'getBalance');
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    // Termii doesn't have a standard webhook signature verification
    // Implement IP whitelisting or other verification as needed
    return true;
  }
}
