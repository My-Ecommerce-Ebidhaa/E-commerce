import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { ApiResponse } from '@/shared/utils/response';

@injectable()
export class PaymentController {
  constructor(@inject(PaymentService) private paymentService: PaymentService) {}

  getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
    const { paymentIntentId } = req.params;

    const paymentIntent = await this.paymentService.retrievePaymentIntent(paymentIntentId);

    res.json(ApiResponse.success({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    }));
  };

  createRefund = async (req: Request, res: Response): Promise<void> => {
    const { paymentIntentId } = req.params;
    const { amount, reason } = req.body;

    const refund = await this.paymentService.createRefund(paymentIntentId, amount, reason);

    res.json(ApiResponse.success(refund, 'Refund processed'));
  };

  // Stripe Connect endpoints for admin

  setupPaymentAccount = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const { email, businessName, country } = req.body;

    const result = await this.paymentService.createConnectedAccount(
      tenantId,
      email,
      businessName,
      country
    );

    res.json(ApiResponse.success(result, 'Payment account setup initiated'));
  };

  getAccountStatus = async (req: Request, res: Response): Promise<void> => {
    const tenant = req.tenant!;

    if (!tenant.settings?.stripeAccountId) {
      res.json(ApiResponse.success({
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      }));
      return;
    }

    const status = await this.paymentService.getConnectedAccountStatus(
      tenant.settings.stripeAccountId
    );

    res.json(ApiResponse.success({
      connected: true,
      ...status,
    }));
  };

  getDashboardLink = async (req: Request, res: Response): Promise<void> => {
    const tenant = req.tenant!;

    if (!tenant.settings?.stripeAccountId) {
      res.status(400).json(ApiResponse.error(
        'Payment account not connected',
        400,
        'ACCOUNT_NOT_CONNECTED'
      ));
      return;
    }

    const url = await this.paymentService.createLoginLink(tenant.settings.stripeAccountId);

    res.json(ApiResponse.success({ url }));
  };
}
