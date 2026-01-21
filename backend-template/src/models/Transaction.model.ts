import { Model } from 'objection';
import { BaseModel } from './Base.model';

export enum TransactionType {
  PAYMENT = 'payment',
  PAYOUT = 'payout',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionDirection {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class Transaction extends BaseModel {
  static tableName = 'transactions';

  id!: string;
  tenant_id!: string;
  order_id?: string;
  type!: TransactionType;
  direction!: TransactionDirection;
  amount!: number;
  currency!: string;
  status!: TransactionStatus;
  provider?: string;
  provider_reference?: string;
  reference!: string;
  description?: string;
  metadata!: Record<string, any>;
  completed_at?: string;
  created_at!: string;
  updated_at!: string;

  static get relationMappings() {
    const { Order } = require('./Order.model');

    return {
      order: {
        relation: Model.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: 'transactions.order_id',
          to: 'orders.id',
        },
      },
    };
  }
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SETTLED = 'settled',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export class Payout extends BaseModel {
  static tableName = 'payouts';

  id!: string;
  tenant_id!: string;
  amount!: number;
  fee!: number;
  net_amount!: number;
  currency!: string;
  status!: PayoutStatus;
  provider?: string;
  provider_reference?: string;
  reference!: string;
  bank_account!: Record<string, any>;
  error_message?: string;
  settled_at?: string;
  created_at!: string;
  updated_at!: string;
}

export class TenantBankAccount extends BaseModel {
  static tableName = 'tenant_bank_accounts';

  id!: string;
  tenant_id!: string;
  account_name!: string;
  account_number!: string;
  bank_code!: string;
  bank_name!: string;
  currency!: string;
  recipient_code?: string;
  provider?: string;
  is_verified!: boolean;
  is_default!: boolean;
  created_at!: string;
  updated_at!: string;
}
