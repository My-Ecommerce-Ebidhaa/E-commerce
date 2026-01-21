import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PaymentService } from '../payment.service';
import { CheckoutService } from '@/modules/checkout/checkout.service';
import { OrderRepository } from '@/repositories/order.repo';
import { TenantRepository } from '@/repositories/tenant.repo';
import { Order } from '@/models/Order.model';
import { logger } from '@/shared/logger';

@injectable()
export class StripeWebhookHandler {
  constructor(
    @inject(PaymentService) private paymentService: PaymentService,
    @inject(CheckoutService) private checkoutService: CheckoutService,
    @inject(OrderRepository) private orderRepo: OrderRepository,
    @inject(TenantRepository) private tenantRepo: TenantRepository
  ) {}

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    let event: Stripe.Event;

    try {
      event = this.paymentService.constructWebhookEvent(
        req.body,
        signature
      );
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    logger.info('Stripe webhook received', { type: event.type, id: event.id });

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;

        default:
          logger.info('Unhandled webhook event type', { type: event.type });
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook handler error', { error, eventType: event.type });
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  };

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
      logger.warn('Payment intent succeeded but no orderId in metadata', {
        paymentIntentId: paymentIntent.id,
      });
      return;
    }

    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      logger.warn('Order not found for payment intent', { orderId, paymentIntentId: paymentIntent.id });
      return;
    }

    if (order.status !== 'pending_payment') {
      logger.info('Order already processed', { orderId, status: order.status });
      return;
    }

    await this.checkoutService.confirmOrder(orderId, paymentIntent.id);

    logger.info('Order confirmed via webhook', { orderId, paymentIntentId: paymentIntent.id });
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    const order = await this.orderRepo.findById(orderId);
    if (!order || order.status !== 'pending_payment') return;

    await Order.query()
      .patch({
        payment_status: 'failed',
        payment_error: paymentIntent.last_payment_error?.message || 'Payment failed',
      })
      .where('id', orderId);

    // Release reserved inventory
    await this.checkoutService.releaseInventory(orderId);

    logger.info('Payment failed, inventory released', { orderId, paymentIntentId: paymentIntent.id });
  }

  private async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    const order = await this.orderRepo.findById(orderId);
    if (!order || order.status !== 'pending_payment') return;

    await this.checkoutService.cancelCheckout(orderId);

    logger.info('Payment cancelled, checkout cancelled', { orderId, paymentIntentId: paymentIntent.id });
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId = typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;

    if (!paymentIntentId) return;

    // Find order by payment intent
    const order = await Order.query()
      .where('payment_intent_id', paymentIntentId)
      .first();

    if (!order) return;

    const refundAmount = charge.amount_refunded / 100;
    const isFullRefund = charge.refunded;

    await Order.query()
      .patch({
        payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
        refunded_amount: refundAmount,
        status: isFullRefund ? 'refunded' : order.status,
      })
      .where('id', order.id);

    logger.info('Order refunded', {
      orderId: order.id,
      refundAmount,
      isFullRefund,
    });
  }

  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const tenantId = account.metadata?.tenantId;
    if (!tenantId) return;

    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) return;

    await this.tenantRepo.updateSettings(tenantId, {
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      stripeOnboardingComplete: account.details_submitted,
    });

    logger.info('Tenant Stripe account updated', {
      tenantId,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });
  }
}
