/**
 * Paystack Payment Provider Adapter
 * Implements IPaymentProvider interface for Paystack
 */

import * as crypto from 'crypto';
import { BaseProvider } from '../base.provider';
import {
  IPaymentProvider,
  PaymentProviderConfig,
  PaymentFeature,
  Bank,
  AccountVerification,
  PaymentInitializeOptions,
  PaymentInitializeResult,
  PaymentVerifyResult,
  ChargeOptions,
  ChargeResult,
  TransferRecipient,
  TransferRecipientResult,
  TransferOptions,
  TransferResult,
  RefundOptions,
  RefundResult,
  VirtualAccountOptions,
  VirtualAccountResult,
  WebhookEvent,
} from './payment.interface';

interface PaystackConfig extends PaymentProviderConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
}

export class PaystackAdapter extends BaseProvider implements IPaymentProvider {
  protected providerName = 'Paystack';

  readonly name = 'paystack';
  readonly supportedCurrencies = ['NGN', 'GHS', 'ZAR', 'USD'];
  readonly supportedFeatures = [
    PaymentFeature.CARD_PAYMENTS,
    PaymentFeature.BANK_TRANSFER,
    PaymentFeature.USSD,
    PaymentFeature.RECURRING_PAYMENTS,
    PaymentFeature.TRANSFERS,
    PaymentFeature.REFUNDS,
    PaymentFeature.VIRTUAL_ACCOUNTS,
    PaymentFeature.SPLIT_PAYMENTS,
  ];

  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly webhookSecret?: string;

  constructor(config: PaystackConfig) {
    super();
    this.baseUrl = config.baseUrl || 'https://api.paystack.co';
    this.secretKey = config.secretKey;
    this.publicKey = config.publicKey;
    this.webhookSecret = config.webhookSecret;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    if (!response.ok || result.status === false) {
      const error: any = new Error(result.message || 'Paystack API error');
      error.statusCode = response.status;
      error.code = result.code;
      error.data = result.data;
      throw error;
    }

    return result;
  }

  async getBankList(country = 'nigeria'): Promise<Bank[]> {
    return this.withRetry(async () => {
      const response = await this.request<{ data: any[] }>(
        'GET',
        `/bank?country=${country}`
      );

      return response.data.map((bank) => ({
        name: bank.name,
        code: bank.code,
        country: bank.country,
        currency: bank.currency,
        type: bank.type,
      }));
    }, 'getBankList');
  }

  async verifyAccountNumber(
    bankCode: string,
    accountNumber: string
  ): Promise<AccountVerification> {
    return this.withRetry(async () => {
      const response = await this.request<{ data: any }>(
        'GET',
        `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
      );

      return {
        accountName: response.data.account_name,
        accountNumber: response.data.account_number,
        bankCode: bankCode,
        bankName: response.data.bank_name,
      };
    }, 'verifyAccountNumber');
  }

  async initializePayment(
    options: PaymentInitializeOptions
  ): Promise<PaymentInitializeResult> {
    return this.withRetry(async () => {
      const response = await this.request<{ data: any }>(
        'POST',
        '/transaction/initialize',
        {
          email: options.email,
          amount: options.amount,
          currency: options.currency,
          reference: options.reference,
          callback_url: options.callbackUrl,
          metadata: options.metadata,
          channels: options.channels,
        }
      );

      return {
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
        reference: response.data.reference,
        provider: this.name,
      };
    }, 'initializePayment');
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResult> {
    return this.withRetry(async () => {
      const response = await this.request<{ data: any }>(
        'GET',
        `/transaction/verify/${reference}`
      );

      const data = response.data;

      const statusMap: Record<string, PaymentVerifyResult['status']> = {
        success: 'success',
        failed: 'failed',
        pending: 'pending',
        abandoned: 'abandoned',
      };

      return {
        status: statusMap[data.status] || 'pending',
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        providerReference: data.id?.toString(),
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
        channel: data.channel,
        customerEmail: data.customer?.email,
        metadata: data.metadata,
        rawResponse: data,
      };
    }, 'verifyPayment');
  }

  async chargeAuthorization(options: ChargeOptions): Promise<ChargeResult> {
    return this.withRetry(async () => {
      const response = await this.request<{ data: any }>(
        'POST',
        '/transaction/charge_authorization',
        {
          authorization_code: options.authorizationCode,
          email: options.email,
          amount: options.amount,
          currency: options.currency,
          reference: options.reference,
          metadata: options.metadata,
        }
      );

      const data = response.data;

      return {
        status: data.status === 'success' ? 'success' : 'failed',
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        providerReference: data.id?.toString(),
        message: data.gateway_response,
      };
    }, 'chargeAuthorization');
  }

  async createTransferRecipient(
    recipient: TransferRecipient
  ): Promise<TransferRecipientResult> {
    return this.withRetry(async () => {
      const response = await this.request<{ data: any }>(
        'POST',
        '/transferrecipient',
        {
          type: recipient.type || 'nuban',
          name: recipient.name,
          account_number: recipient.accountNumber,
          bank_code: recipient.bankCode,
          currency: recipient.currency,
          metadata: recipient.metadata,
        }
      );

      return {
        recipientCode: response.data.recipient_code,
        name: response.data.name,
        accountNumber: response.data.details.account_number,
        bankCode: response.data.details.bank_code,
        bankName: response.data.details.bank_name,
        currency: response.data.currency,
      };
    }, 'createTransferRecipient');
  }

  async initiateTransfer(options: TransferOptions): Promise<TransferResult> {
    return this.withRetry(async () => {
      const response = await this.request<{ data: any }>(
        'POST',
        '/transfer',
        {
          source: 'balance',
          amount: options.amount,
          currency: options.currency,
          recipient: options.recipientCode,
          reference: options.reference,
          reason: options.reason,
          metadata: options.metadata,
        }
      );

      const data = response.data;

      return {
        transferCode: data.transfer_code,
        reference: data.reference,
        status: this.mapTransferStatus(data.status),
        amount: data.amount,
        currency: data.currency,
        recipientCode: data.recipient,
        reason: data.reason,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      };
    }, 'initiateTransfer');
  }

  async verifyTransfer(reference: string): Promise<TransferResult> {
    return this.withRetry(async () => {
      const response = await this.request<{ data: any }>(
        'GET',
        `/transfer/verify/${reference}`
      );

      const data = response.data;

      return {
        transferCode: data.transfer_code,
        reference: data.reference,
        status: this.mapTransferStatus(data.status),
        amount: data.amount,
        currency: data.currency,
        recipientCode: data.recipient?.recipient_code,
        reason: data.reason,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      };
    }, 'verifyTransfer');
  }

  async refund(options: RefundOptions): Promise<RefundResult> {
    return this.withRetry(async () => {
      const response = await this.request<{ data: any }>(
        'POST',
        '/refund',
        {
          transaction: options.transactionReference,
          amount: options.amount,
          merchant_note: options.reason,
        }
      );

      const data = response.data;

      return {
        refundReference: data.id?.toString(),
        transactionReference: data.transaction?.reference,
        amount: data.amount,
        currency: data.currency,
        status: data.status === 'processed' ? 'processed' : 'pending',
        reason: data.merchant_note,
      };
    }, 'refund');
  }

  async createVirtualAccount(
    options: VirtualAccountOptions
  ): Promise<VirtualAccountResult> {
    return this.withRetry(async () => {
      // First, create or get customer
      const customerResponse = await this.request<{ data: any }>(
        'POST',
        '/customer',
        {
          email: options.email,
          first_name: options.customerName.split(' ')[0],
          last_name: options.customerName.split(' ').slice(1).join(' ') || 'Customer',
          phone: options.phoneNumber,
          metadata: options.metadata,
        }
      );

      const customerCode = customerResponse.data.customer_code;

      // Validate customer (required for DVA)
      if (options.bvn) {
        await this.request('POST', '/customer/validate', {
          code: customerCode,
          bvn: options.bvn,
        });
      }

      // Create dedicated virtual account
      const response = await this.request<{ data: any }>(
        'POST',
        '/dedicated_account',
        {
          customer: customerCode,
          preferred_bank: options.preferredBank,
        }
      );

      return {
        accountNumber: response.data.account_number,
        accountName: response.data.account_name,
        bankName: response.data.bank.name,
        bankCode: response.data.bank.slug,
        reference: response.data.customer?.customer_code,
        currency: 'NGN',
      };
    }, 'createVirtualAccount');
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.log('warn', 'Webhook secret not configured');
      return false;
    }

    const hash = crypto
      .createHmac('sha512', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  parseWebhookEvent(payload: string): WebhookEvent {
    const data = JSON.parse(payload);

    return {
      event: data.event,
      data: data.data,
      rawPayload: payload,
    };
  }

  private mapTransferStatus(
    status: string
  ): TransferResult['status'] {
    const statusMap: Record<string, TransferResult['status']> = {
      success: 'success',
      failed: 'failed',
      reversed: 'reversed',
      pending: 'pending',
      processing: 'pending',
      otp: 'pending',
    };

    return statusMap[status] || 'pending';
  }
}
