import { injectable, inject } from 'tsyringe';
import Stripe from 'stripe';
import { config } from '@/config';
import { TenantRepository } from '@/repositories/tenant.repo';
import { OrderRepository } from '@/repositories/order.repo';
import { AppError } from '@/shared/errors/app.error';
import { logger } from '@/shared/logger';

interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  status: string;
}

interface RefundResult {
  refundId: string;
  status: string;
  amount: number;
}

@injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @inject(TenantRepository) private tenantRepo: TenantRepository,
    @inject(OrderRepository) private orderRepo: OrderRepository
  ) {
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(
    tenantId: string,
    orderId: string,
    amount: number,
    metadata: Record<string, string> = {}
  ): Promise<PaymentIntentResult> {
    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }

    // Get tenant's Stripe account for connected accounts (optional)
    const stripeAccount = tenant.settings?.stripeAccountId;

    try {
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: tenant.settings?.currency || 'usd',
        metadata: {
          tenantId,
          orderId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      };

      // If tenant has connected Stripe account, use application fee
      let paymentIntent: Stripe.PaymentIntent;

      if (stripeAccount) {
        // Connected account flow with platform fee
        const platformFeePercent = config.stripe.platformFeePercent || 2;
        const applicationFee = Math.round(amount * 100 * (platformFeePercent / 100));

        paymentIntent = await this.stripe.paymentIntents.create(
          {
            ...paymentIntentParams,
            application_fee_amount: applicationFee,
            transfer_data: {
              destination: stripeAccount,
            },
          }
        );
      } else {
        // Direct platform payment
        paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);
      }

      logger.info('Payment intent created', {
        paymentIntentId: paymentIntent.id,
        orderId,
        amount,
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status,
      };
    } catch (error) {
      logger.error('Failed to create payment intent', { error, orderId, amount });
      throw new AppError(
        'Failed to initialize payment',
        500,
        'PAYMENT_INIT_FAILED'
      );
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      logger.error('Failed to retrieve payment intent', { error, paymentIntentId });
      throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      logger.error('Failed to confirm payment intent', { error, paymentIntentId });
      throw new AppError('Payment confirmation failed', 400, 'PAYMENT_CONFIRM_FAILED');
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
      logger.info('Payment intent cancelled', { paymentIntentId });
    } catch (error) {
      logger.error('Failed to cancel payment intent', { error, paymentIntentId });
      // Don't throw - cancellation failure shouldn't block the flow
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<RefundResult> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason: (reason as Stripe.RefundCreateParams.Reason) || 'requested_by_customer',
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundParams);

      logger.info('Refund created', {
        refundId: refund.id,
        paymentIntentId,
        amount: refund.amount,
      });

      return {
        refundId: refund.id,
        status: refund.status || 'pending',
        amount: refund.amount / 100,
      };
    } catch (error) {
      logger.error('Failed to create refund', { error, paymentIntentId });
      throw new AppError('Refund failed', 400, 'REFUND_FAILED');
    }
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      throw new AppError('Invalid webhook signature', 400, 'INVALID_WEBHOOK_SIGNATURE');
    }
  }

  // Stripe Connect methods for multi-tenant

  async createConnectedAccount(
    tenantId: string,
    email: string,
    businessName: string,
    country: string = 'US'
  ): Promise<{ accountId: string; onboardingUrl: string }> {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country,
        email,
        business_type: 'company',
        company: {
          name: businessName,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          tenantId,
        },
      });

      // Create account onboarding link
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${config.app.frontendUrl}/admin/settings/payments?refresh=true`,
        return_url: `${config.app.frontendUrl}/admin/settings/payments?success=true`,
        type: 'account_onboarding',
      });

      // Save account ID to tenant
      await this.tenantRepo.updateSettings(tenantId, {
        stripeAccountId: account.id,
        stripeOnboardingComplete: false,
      });

      logger.info('Connected account created', { tenantId, accountId: account.id });

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
      };
    } catch (error) {
      logger.error('Failed to create connected account', { error, tenantId });
      throw new AppError('Failed to setup payment account', 500, 'ACCOUNT_SETUP_FAILED');
    }
  }

  async getConnectedAccountStatus(accountId: string): Promise<{
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  }> {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      return {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      };
    } catch (error) {
      logger.error('Failed to get account status', { error, accountId });
      throw new AppError('Failed to get account status', 500, 'ACCOUNT_STATUS_FAILED');
    }
  }

  async createLoginLink(accountId: string): Promise<string> {
    try {
      const loginLink = await this.stripe.accounts.createLoginLink(accountId);
      return loginLink.url;
    } catch (error) {
      logger.error('Failed to create login link', { error, accountId });
      throw new AppError('Failed to create dashboard link', 500, 'LOGIN_LINK_FAILED');
    }
  }
}
