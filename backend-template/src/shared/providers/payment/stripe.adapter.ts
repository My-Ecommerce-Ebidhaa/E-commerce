/**
 * Stripe Payment Provider Adapter
 * Implements IPaymentProvider interface for Stripe
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
  RefundOptions,
  RefundResult,
  WebhookEvent,
} from './payment.interface';

interface StripeConfig extends PaymentProviderConfig {
  secretKey: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
}

export class StripeAdapter extends BaseProvider implements IPaymentProvider {
  protected providerName = 'Stripe';

  readonly name = 'stripe';
  readonly supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'];
  readonly supportedFeatures = [
    PaymentFeature.CARD_PAYMENTS,
    PaymentFeature.RECURRING_PAYMENTS,
    PaymentFeature.REFUNDS,
    PaymentFeature.TRANSFERS,
  ];

  private readonly baseUrl = 'https://api.stripe.com/v1';
  private readonly secretKey: string;
  private readonly webhookSecret?: string;

  constructor(config: StripeConfig) {
    super();
    this.secretKey = config.secretKey;
    this.webhookSecret = config.webhookSecret;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    data?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const body = data
      ? new URLSearchParams(this.flattenObject(data)).toString()
      : undefined;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      const error: any = new Error(
        result.error?.message || 'Stripe API error'
      );
      error.statusCode = response.status;
      error.code = result.error?.code;
      error.type = result.error?.type;
      throw error;
    }

    return result;
  }

  private flattenObject(
    obj: Record<string, any>,
    prefix = ''
  ): Record<string, string> {
    return Object.keys(obj).reduce((acc: Record<string, string>, key) => {
      const prefixedKey = prefix ? `${prefix}[${key}]` : key;

      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(acc, this.flattenObject(obj[key], prefixedKey));
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any, index: number) => {
          if (typeof item === 'object') {
            Object.assign(acc, this.flattenObject(item, `${prefixedKey}[${index}]`));
          } else {
            acc[`${prefixedKey}[${index}]`] = String(item);
          }
        });
      } else if (obj[key] !== undefined) {
        acc[prefixedKey] = String(obj[key]);
      }

      return acc;
    }, {});
  }

  async getBankList(_country?: string): Promise<Bank[]> {
    // Stripe doesn't have a direct bank list API
    // Return empty as Stripe uses different payment methods
    return [];
  }

  async verifyAccountNumber(
    _bankCode: string,
    _accountNumber: string
  ): Promise<AccountVerification> {
    throw new Error('Account verification not supported by Stripe');
  }

  async initializePayment(
    options: PaymentInitializeOptions
  ): Promise<PaymentInitializeResult> {
    return this.withRetry(async () => {
      // Create a Checkout Session
      const session = await this.request<any>('POST', '/checkout/sessions', {
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: options.email,
        line_items: [
          {
            price_data: {
              currency: options.currency.toLowerCase(),
              product_data: {
                name: options.metadata?.productName || 'Order',
                description: options.metadata?.description,
              },
              unit_amount: options.amount,
            },
            quantity: 1,
          },
        ],
        success_url: `${options.callbackUrl}?reference=${options.reference}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: options.callbackUrl,
        client_reference_id: options.reference,
        metadata: options.metadata,
      });

      return {
        authorizationUrl: session.url,
        accessCode: session.id,
        reference: options.reference,
        provider: this.name,
      };
    }, 'initializePayment');
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResult> {
    return this.withRetry(async () => {
      // First try to find by client_reference_id
      const sessions = await this.request<any>(
        'GET',
        `/checkout/sessions?client_reference_id=${reference}&limit=1`
      );

      if (!sessions.data || sessions.data.length === 0) {
        throw new Error('Session not found');
      }

      const session = sessions.data[0];

      const statusMap: Record<string, PaymentVerifyResult['status']> = {
        complete: 'success',
        expired: 'abandoned',
        open: 'pending',
      };

      return {
        status: statusMap[session.status] || 'pending',
        amount: session.amount_total,
        currency: session.currency.toUpperCase(),
        reference: session.client_reference_id,
        providerReference: session.payment_intent,
        paidAt: session.status === 'complete' ? new Date() : undefined,
        channel: 'card',
        customerEmail: session.customer_email,
        metadata: session.metadata,
        rawResponse: session,
      };
    }, 'verifyPayment');
  }

  async chargeAuthorization(options: ChargeOptions): Promise<ChargeResult> {
    return this.withRetry(async () => {
      // In Stripe, we use PaymentIntents with a saved payment method
      const paymentIntent = await this.request<any>('POST', '/payment_intents', {
        amount: options.amount,
        currency: options.currency.toLowerCase(),
        customer: options.authorizationCode, // This should be customer ID
        payment_method: options.metadata?.paymentMethodId,
        off_session: true,
        confirm: true,
        metadata: {
          reference: options.reference,
          ...options.metadata,
        },
      });

      return {
        status: paymentIntent.status === 'succeeded' ? 'success' : 'failed',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        reference: options.reference,
        providerReference: paymentIntent.id,
        message: paymentIntent.status,
      };
    }, 'chargeAuthorization');
  }

  async refund(options: RefundOptions): Promise<RefundResult> {
    return this.withRetry(async () => {
      const refund = await this.request<any>('POST', '/refunds', {
        payment_intent: options.transactionReference,
        amount: options.amount,
        reason: options.reason === 'customer_request' ? 'requested_by_customer' : 'other',
        metadata: options.metadata,
      });

      return {
        refundReference: refund.id,
        transactionReference: refund.payment_intent,
        amount: refund.amount,
        currency: refund.currency.toUpperCase(),
        status: refund.status === 'succeeded' ? 'processed' : 'pending',
        reason: refund.reason,
      };
    }, 'refund');
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.log('warn', 'Webhook secret not configured');
      return false;
    }

    try {
      const elements = signature.split(',');
      const signatureElements: Record<string, string> = {};

      elements.forEach((element) => {
        const [key, value] = element.split('=');
        signatureElements[key] = value;
      });

      const timestamp = signatureElements['t'];
      const v1Signature = signatureElements['v1'];

      if (!timestamp || !v1Signature) {
        return false;
      }

      const signedPayload = `${timestamp}.${payload}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(signedPayload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(v1Signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }

  parseWebhookEvent(payload: string): WebhookEvent {
    const data = JSON.parse(payload);

    return {
      event: data.type,
      data: data.data?.object || data.data,
      rawPayload: payload,
    };
  }
}
