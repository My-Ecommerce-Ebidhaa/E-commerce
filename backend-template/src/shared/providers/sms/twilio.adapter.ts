/**
 * Twilio SMS Provider Adapter
 * Implements ISmsProvider interface for Twilio
 */

import * as crypto from 'crypto';
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

interface TwilioConfig extends SmsProviderConfig {
  accountSid: string;
  authToken: string;
  senderId?: string;
  verifyServiceSid?: string; // For OTP via Verify API
}

export class TwilioAdapter extends BaseProvider implements ISmsProvider {
  protected providerName = 'Twilio';

  readonly name = 'twilio';
  readonly supportedFeatures = [
    SmsFeature.BULK_SMS,
    SmsFeature.OTP,
    SmsFeature.DELIVERY_REPORTS,
    SmsFeature.UNICODE,
    SmsFeature.VOICE,
    SmsFeature.WHATSAPP,
  ];

  private readonly baseUrl: string;
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly defaultSenderId?: string;
  private readonly verifyServiceSid?: string;

  constructor(config: TwilioConfig) {
    super();
    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
    this.defaultSenderId = config.senderId;
    this.verifyServiceSid = config.verifyServiceSid;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    data?: Record<string, any>
  ): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString(
      'base64'
    );

    const body = data
      ? new URLSearchParams(
          Object.entries(data).reduce(
            (acc, [key, value]) => {
              if (value !== undefined) {
                acc[key] = String(value);
              }
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString()
      : undefined;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error: any = new Error(result.message || 'Twilio API error');
      error.statusCode = response.status;
      error.code = result.code;
      error.moreInfo = result.more_info;
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

      // Twilio requires sending to each recipient separately
      const recipient = recipients[0];

      const response = await this.request<any>('POST', '/Messages.json', {
        To: recipient,
        From: from,
        Body: options.message,
        ...(options.scheduledAt && {
          ScheduleType: 'fixed',
          SendAt: options.scheduledAt.toISOString(),
        }),
      });

      return {
        messageId: response.sid,
        provider: this.name,
        status: response.status === 'failed' ? 'failed' : 'sent',
        to: response.to,
        segments: response.num_segments,
        cost: parseFloat(response.price || '0'),
        currency: response.price_unit,
        rawResponse: response,
      };
    }, 'sendSms');
  }

  async sendBulkSms(options: BulkSmsOptions): Promise<BulkSmsResult> {
    const results: BulkSmsResult['results'] = [];
    let totalSent = 0;
    let totalFailed = 0;
    let totalCost = 0;

    for (const msg of options.messages) {
      try {
        const result = await this.sendSms({
          to: msg.to,
          message: msg.message,
          from: options.from,
          type: options.type,
          reference: msg.reference,
        });

        results.push({
          to: msg.to,
          messageId: result.messageId,
          status: 'sent',
        });
        totalSent++;
        totalCost += result.cost || 0;
      } catch (error: any) {
        results.push({
          to: msg.to,
          status: 'failed',
          error: error.message,
        });
        totalFailed++;
      }

      // Small delay to avoid rate limiting
      await this.sleep(50);
    }

    return {
      totalSent,
      totalFailed,
      totalCost,
      currency: 'USD',
      results,
    };
  }

  async sendOtp(options: OtpOptions): Promise<OtpSendResult> {
    if (!this.verifyServiceSid) {
      throw new Error('Verify Service SID is required for OTP');
    }

    return this.withRetry(async () => {
      const url = `https://verify.twilio.com/v2/Services/${this.verifyServiceSid}/Verifications`;

      const response = await this.request<any>('POST', url, {
        To: options.to,
        Channel: options.channel || 'sms',
        ...(options.length && { CodeLength: options.length }),
      });

      return {
        pinId: response.sid,
        to: response.to,
        status: response.status === 'pending' ? 'sent' : 'failed',
        expiresAt: new Date(response.date_created).getTime() + 10 * 60 * 1000, // 10 minutes default
      };
    }, 'sendOtp');
  }

  async verifyOtp(pinId: string, otp: string): Promise<OtpVerifyResult> {
    if (!this.verifyServiceSid) {
      throw new Error('Verify Service SID is required for OTP verification');
    }

    return this.withRetry(async () => {
      const url = `https://verify.twilio.com/v2/Services/${this.verifyServiceSid}/VerificationCheck`;

      try {
        const response = await this.request<any>('POST', url, {
          VerificationSid: pinId,
          Code: otp,
        });

        return {
          valid: response.status === 'approved',
          pinId: response.sid,
        };
      } catch (error: any) {
        if (error.code === 20404) {
          return {
            valid: false,
            pinId,
          };
        }
        throw error;
      }
    }, 'verifyOtp');
  }

  async getSmsStatus(messageId: string): Promise<{
    status: 'delivered' | 'sent' | 'failed' | 'rejected' | 'pending';
    deliveredAt?: Date;
    error?: string;
  }> {
    return this.withRetry(async () => {
      const response = await this.request<any>('GET', `/Messages/${messageId}.json`);

      const statusMap: Record<
        string,
        'delivered' | 'sent' | 'failed' | 'rejected' | 'pending'
      > = {
        delivered: 'delivered',
        sent: 'sent',
        failed: 'failed',
        undelivered: 'failed',
        queued: 'pending',
        sending: 'pending',
        accepted: 'pending',
      };

      return {
        status: statusMap[response.status] || 'pending',
        deliveredAt: response.date_sent ? new Date(response.date_sent) : undefined,
        error: response.error_message,
      };
    }, 'getSmsStatus');
  }

  async getBalance(): Promise<{ balance: number; currency: string }> {
    return this.withRetry(async () => {
      const response = await this.request<any>('GET', '/Balance.json');

      return {
        balance: parseFloat(response.balance),
        currency: response.currency,
      };
    }, 'getBalance');
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Twilio uses X-Twilio-Signature header with HMAC-SHA1
    const expectedSignature = crypto
      .createHmac('sha1', this.authToken)
      .update(payload)
      .digest('base64');

    return signature === expectedSignature;
  }
}
