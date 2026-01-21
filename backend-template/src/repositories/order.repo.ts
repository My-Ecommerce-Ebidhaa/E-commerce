import { injectable } from 'tsyringe';
import { BaseRepository, QueryOptions } from './base.repo';
import { Order, OrderItem } from '@/models/Order.model';
import { OrderStatus, PaymentStatus } from '@/shared/enums/generic.enum';
import { PaginatedResult } from '@/shared/utils/response.util';
import { Transaction } from 'objection';

export interface OrderQueryParams extends QueryOptions {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

@injectable()
export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(Order);
  }

  async findByOrderNumber(
    tenantId: string,
    orderNumber: string
  ): Promise<Order | undefined> {
    return Order.query()
      .where('tenant_id', tenantId)
      .where('order_number', orderNumber)
      .withGraphFetched('[items.[product], user]')
      .first();
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined> {
    return Order.query()
      .where('payment_intent_id', paymentIntentId)
      .withGraphFetched('[items.[product], user]')
      .first();
  }

  async findByTenant(
    tenantId: string,
    params: OrderQueryParams = {}
  ): Promise<PaginatedResult<Order>> {
    const {
      page = 1,
      limit = 20,
      orderBy = 'created_at',
      orderDir = 'desc',
      status,
      paymentStatus,
      userId,
      startDate,
      endDate,
    } = params;

    let query = Order.query().where('tenant_id', tenantId);

    if (status) {
      query = query.where('status', status);
    }

    if (paymentStatus) {
      query = query.where('payment_status', paymentStatus);
    }

    if (userId) {
      query = query.where('user_id', userId);
    }

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }

    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const offset = (page - 1) * limit;

    const [orders, countResult] = await Promise.all([
      query
        .clone()
        .orderBy(orderBy, orderDir)
        .offset(offset)
        .limit(limit)
        .withGraphFetched('[items, user]'),
      query.clone().count('* as count').first(),
    ]);

    const total = Number((countResult as { count: string })?.count || 0);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(
    userId: string,
    params: OrderQueryParams = {}
  ): Promise<PaginatedResult<Order>> {
    return this.findByTenant('', { ...params, userId });
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return Order.query().patchAndFetchById(orderId, { status });
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<Order> {
    return Order.query().patchAndFetchById(orderId, { payment_status: paymentStatus });
  }

  async updateTracking(
    orderId: string,
    trackingNumber: string,
    trackingUrl?: string
  ): Promise<Order> {
    return Order.query().patchAndFetchById(orderId, {
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      fulfillment_status: 'fulfilled',
    });
  }

  async getOrderStats(
    tenantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    let query = Order.query()
      .where('tenant_id', tenantId)
      .where('payment_status', PaymentStatus.PAID);

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }

    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const result = await query
      .count('* as totalOrders')
      .sum('total as totalRevenue')
      .avg('total as averageOrderValue')
      .first();

    return {
      totalOrders: Number((result as any)?.totalOrders || 0),
      totalRevenue: Number((result as any)?.totalRevenue || 0),
      averageOrderValue: Number((result as any)?.averageOrderValue || 0),
    };
  }
}

@injectable()
export class OrderItemRepository extends BaseRepository<OrderItem> {
  constructor() {
    super(OrderItem);
  }

  async createItems(
    items: Partial<OrderItem>[],
    trx?: Transaction
  ): Promise<OrderItem[]> {
    const query = trx ? OrderItem.query(trx) : OrderItem.query();
    return query.insert(items as object[]) as unknown as Promise<OrderItem[]>;
  }

  async findByOrder(orderId: string): Promise<OrderItem[]> {
    return OrderItem.query()
      .where('order_id', orderId)
      .withGraphFetched('[product, variant]');
  }
}
