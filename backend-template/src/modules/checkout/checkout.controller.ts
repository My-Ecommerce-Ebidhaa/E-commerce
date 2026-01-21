import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import { CheckoutService } from './checkout.service';
import { PaymentService } from '@/modules/payment/payment.service';
import { ApiResponse } from '@/shared/utils/response.util';
import { InitiateCheckoutDto, CalculateShippingDto } from './dto/checkout.dto';

@injectable()
export class CheckoutController {
  constructor(
    @inject(CheckoutService) private checkoutService: CheckoutService,
    @inject(PaymentService) private paymentService: PaymentService
  ) {}

  calculateShipping = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const dto: CalculateShippingDto = req.body;

    const rates = await this.checkoutService.calculateShipping(
      tenantId,
      dto.postalCode,
      dto.country
    );

    res.json(ApiResponse.success(rates));
  };

  validateDiscount = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const { code, subtotal } = req.body;

    const result = await this.checkoutService.validateDiscount(
      tenantId,
      code,
      subtotal
    );

    res.json(ApiResponse.success(result));
  };

  initiateCheckout = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const dto: InitiateCheckoutDto = req.body;

    const checkoutSession = await this.checkoutService.initiateCheckout(
      tenantId,
      userId,
      sessionId,
      dto
    );

    // Create payment intent
    const paymentIntent = await this.paymentService.createPaymentIntent(
      tenantId,
      checkoutSession.orderId,
      checkoutSession.total,
      {
        orderId: checkoutSession.orderId,
        userId: userId || 'guest',
      }
    );

    res.status(201).json(ApiResponse.success({
      ...checkoutSession,
      clientSecret: paymentIntent.clientSecret,
    }, 'Checkout initiated'));
  };

  confirmCheckout = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const { orderId } = req.params;
    const { paymentIntentId } = req.body;

    const order = await this.checkoutService.confirmOrder(orderId, paymentIntentId);

    res.json(ApiResponse.success({
      orderId: order.id,
      orderNumber: order.order_number,
      status: order.status,
      total: order.total,
    }, 'Order confirmed'));
  };

  cancelCheckout = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;

    await this.checkoutService.cancelCheckout(orderId);

    res.json(ApiResponse.success(null, 'Checkout cancelled'));
  };

  getOrder = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const { orderId } = req.params;

    const order = await this.checkoutService.getOrder(orderId, tenantId);

    if (!order) {
      res.status(404).json(ApiResponse.error('Order not found', 404, 'ORDER_NOT_FOUND'));
      return;
    }

    res.json(ApiResponse.success({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      shippingMethod: order.shipping_method,
      items: order.items?.map(item => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        productSnapshot: item.product_snapshot,
      })),
      createdAt: order.created_at,
    }));
  };
}
