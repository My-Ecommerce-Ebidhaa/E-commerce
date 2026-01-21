/**
 * Payment Provider Interface
 * Standardized interface for all payment providers (Paystack, Stripe, Flutterwave, etc.)
 */

export interface Bank {
  name: string;
  code: string;
  country: string;
  currency?: string;
  type?: string;
}

export interface AccountVerification {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName?: string;
}

export interface PaymentInitializeOptions {
  email: string;
  amount: number; // In smallest currency unit (kobo, cents)
  currency: string;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  customerName?: string;
  channels?: string[]; // card, bank, ussd, qr, etc.
}

export interface PaymentInitializeResult {
  authorizationUrl: string;
  accessCode?: string;
  reference: string;
  provider: string;
}

export interface PaymentVerifyResult {
  status: 'success' | 'failed' | 'pending' | 'abandoned';
  amount: number;
  currency: string;
  reference: string;
  providerReference?: string;
  paidAt?: Date;
  channel?: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
  rawResponse?: any;
}

export interface ChargeOptions {
  amount: number;
  currency: string;
  reference: string;
  authorizationCode: string; // For recurring charges
  email: string;
  metadata?: Record<string, any>;
}

export interface ChargeResult {
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  reference: string;
  providerReference?: string;
  message?: string;
}

export interface TransferRecipient {
  name: string;
  accountNumber: string;
  bankCode: string;
  currency: string;
  type?: 'nuban' | 'mobile_money' | 'basa' | 'authorization';
  metadata?: Record<string, any>;
}

export interface TransferRecipientResult {
  recipientCode: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName?: string;
  currency: string;
}

export interface TransferOptions {
  amount: number;
  currency: string;
  recipientCode: string;
  reference: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface TransferResult {
  transferCode: string;
  reference: string;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  amount: number;
  currency: string;
  recipientCode?: string;
  reason?: string;
  completedAt?: Date;
}

export interface RefundOptions {
  transactionReference: string;
  amount?: number; // Partial refund
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  refundReference: string;
  transactionReference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processed' | 'failed';
  reason?: string;
}

export interface VirtualAccountOptions {
  email: string;
  customerName: string;
  bvn?: string;
  phoneNumber?: string;
  preferredBank?: string;
  metadata?: Record<string, any>;
}

export interface VirtualAccountResult {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode?: string;
  reference?: string;
  currency: string;
}

export interface WebhookEvent {
  event: string;
  data: Record<string, any>;
  rawPayload: string;
}

export interface IPaymentProvider {
  readonly name: string;
  readonly supportedCurrencies: string[];
  readonly supportedFeatures: PaymentFeature[];

  /**
   * Get list of supported banks
   */
  getBankList(country?: string): Promise<Bank[]>;

  /**
   * Verify a bank account
   */
  verifyAccountNumber(bankCode: string, accountNumber: string): Promise<AccountVerification>;

  /**
   * Initialize a payment
   */
  initializePayment(options: PaymentInitializeOptions): Promise<PaymentInitializeResult>;

  /**
   * Verify a payment
   */
  verifyPayment(reference: string): Promise<PaymentVerifyResult>;

  /**
   * Charge a saved card/authorization
   */
  chargeAuthorization?(options: ChargeOptions): Promise<ChargeResult>;

  /**
   * Create a transfer recipient
   */
  createTransferRecipient?(recipient: TransferRecipient): Promise<TransferRecipientResult>;

  /**
   * Initiate a transfer/payout
   */
  initiateTransfer?(options: TransferOptions): Promise<TransferResult>;

  /**
   * Verify a transfer
   */
  verifyTransfer?(reference: string): Promise<TransferResult>;

  /**
   * Process a refund
   */
  refund?(options: RefundOptions): Promise<RefundResult>;

  /**
   * Create a dedicated virtual account
   */
  createVirtualAccount?(options: VirtualAccountOptions): Promise<VirtualAccountResult>;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean;

  /**
   * Parse webhook event
   */
  parseWebhookEvent(payload: string): WebhookEvent;
}

export enum PaymentFeature {
  CARD_PAYMENTS = 'card_payments',
  BANK_TRANSFER = 'bank_transfer',
  USSD = 'ussd',
  QR_CODE = 'qr_code',
  RECURRING_PAYMENTS = 'recurring_payments',
  TRANSFERS = 'transfers',
  REFUNDS = 'refunds',
  VIRTUAL_ACCOUNTS = 'virtual_accounts',
  SPLIT_PAYMENTS = 'split_payments',
}

export interface PaymentProviderConfig {
  publicKey?: string;
  secretKey: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
  baseUrl?: string;
  merchantId?: string;
  [key: string]: any;
}
