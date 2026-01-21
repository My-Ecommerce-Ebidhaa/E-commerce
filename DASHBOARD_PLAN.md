# Dashboard Architecture Plan

## Overview

Two separate dashboard applications:

1. **Tenant Admin Dashboard** (`/admin`) - For business owners and their staff
2. **Platform Super Admin Dashboard** (`/platform`) - For platform operators to onboard and manage businesses

---

## Part 1: Database Schema Additions

### 1.1 Roles & Permissions Tables

```sql
-- Roles table (tenant-specific roles)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,  -- System roles can't be deleted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- Permissions table (global permission definitions)
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  module VARCHAR(50) NOT NULL,  -- products, orders, customers, settings, etc.
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role-Permission mapping
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- User-Role mapping (users can have multiple roles)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Staff invitations
CREATE TABLE staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Provider Configuration Tables

```sql
-- Payment providers configuration per tenant
CREATE TABLE tenant_payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,  -- stripe, paypal, square, razorpay, flutterwave
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  credentials JSONB NOT NULL,  -- Encrypted credentials
  settings JSONB DEFAULT '{}',  -- Provider-specific settings
  webhook_secret VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, provider)
);

-- Email providers configuration per tenant
CREATE TABLE tenant_email_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,  -- sendgrid, mailgun, ses, postmark, smtp
  is_active BOOLEAN DEFAULT FALSE,
  credentials JSONB NOT NULL,  -- Encrypted credentials
  settings JSONB DEFAULT '{}',  -- from_email, from_name, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, provider)
);

-- SMS providers configuration per tenant
CREATE TABLE tenant_sms_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,  -- twilio, nexmo, africastalking, termii
  is_active BOOLEAN DEFAULT FALSE,
  credentials JSONB NOT NULL,  -- Encrypted credentials
  settings JSONB DEFAULT '{}',  -- sender_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, provider)
);

-- Notification templates per tenant
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,  -- order_confirmation, shipping_update, etc.
  channel VARCHAR(20) NOT NULL,  -- email, sms
  subject VARCHAR(255),  -- For email
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',  -- Available template variables
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, type, channel)
);
```

### 1.3 Platform Admin Tables

```sql
-- Platform admins (separate from tenant users)
CREATE TABLE platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'admin',  -- super_admin, admin, support
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for platform actions
CREATE TABLE platform_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES platform_admins(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),  -- tenant, user, provider, etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant audit log (for tenant admin actions)
CREATE TABLE tenant_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',  -- max_products, max_staff, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant subscriptions
CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(50) DEFAULT 'active',  -- active, cancelled, past_due, trialing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Part 2: Backend Modules

### 2.1 New Modules Structure

```
backend-template/src/
├── modules/
│   ├── role/
│   │   ├── dto/
│   │   │   └── role.dto.ts
│   │   ├── role.service.ts
│   │   ├── role.controller.ts
│   │   └── role.routes.ts
│   │
│   ├── permission/
│   │   ├── permission.service.ts
│   │   ├── permission.controller.ts
│   │   └── permission.routes.ts
│   │
│   ├── staff/
│   │   ├── dto/
│   │   │   └── staff.dto.ts
│   │   ├── staff.service.ts
│   │   ├── staff.controller.ts
│   │   └── staff.routes.ts
│   │
│   ├── provider/
│   │   ├── payment/
│   │   │   ├── payment-provider.factory.ts
│   │   │   ├── adapters/
│   │   │   │   ├── stripe.adapter.ts
│   │   │   │   ├── paypal.adapter.ts
│   │   │   │   ├── square.adapter.ts
│   │   │   │   └── flutterwave.adapter.ts
│   │   │   └── payment-provider.interface.ts
│   │   │
│   │   ├── email/
│   │   │   ├── email-provider.factory.ts
│   │   │   ├── adapters/
│   │   │   │   ├── sendgrid.adapter.ts
│   │   │   │   ├── mailgun.adapter.ts
│   │   │   │   ├── ses.adapter.ts
│   │   │   │   └── smtp.adapter.ts
│   │   │   └── email-provider.interface.ts
│   │   │
│   │   ├── sms/
│   │   │   ├── sms-provider.factory.ts
│   │   │   ├── adapters/
│   │   │   │   ├── twilio.adapter.ts
│   │   │   │   ├── nexmo.adapter.ts
│   │   │   │   └── africastalking.adapter.ts
│   │   │   └── sms-provider.interface.ts
│   │   │
│   │   ├── provider.service.ts
│   │   ├── provider.controller.ts
│   │   └── provider.routes.ts
│   │
│   ├── notification/
│   │   ├── dto/
│   │   │   └── notification.dto.ts
│   │   ├── notification.service.ts
│   │   ├── notification.controller.ts
│   │   └── notification.routes.ts
│   │
│   ├── analytics/
│   │   ├── analytics.service.ts
│   │   ├── analytics.controller.ts
│   │   └── analytics.routes.ts
│   │
│   └── platform/
│       ├── tenant-management/
│       │   ├── dto/
│       │   │   └── tenant.dto.ts
│       │   ├── tenant-management.service.ts
│       │   ├── tenant-management.controller.ts
│       │   └── tenant-management.routes.ts
│       │
│       ├── platform-auth/
│       │   ├── platform-auth.service.ts
│       │   ├── platform-auth.controller.ts
│       │   └── platform-auth.routes.ts
│       │
│       ├── subscription/
│       │   ├── subscription.service.ts
│       │   ├── subscription.controller.ts
│       │   └── subscription.routes.ts
│       │
│       └── audit/
│           ├── audit.service.ts
│           └── audit.routes.ts
```

### 2.2 Default Permissions List

```typescript
// permissions.seed.ts
export const DEFAULT_PERMISSIONS = [
  // Dashboard
  { module: 'dashboard', slug: 'dashboard.view', name: 'View Dashboard' },

  // Products
  { module: 'products', slug: 'products.view', name: 'View Products' },
  { module: 'products', slug: 'products.create', name: 'Create Products' },
  { module: 'products', slug: 'products.edit', name: 'Edit Products' },
  { module: 'products', slug: 'products.delete', name: 'Delete Products' },
  { module: 'products', slug: 'products.manage_inventory', name: 'Manage Inventory' },

  // Categories
  { module: 'categories', slug: 'categories.view', name: 'View Categories' },
  { module: 'categories', slug: 'categories.create', name: 'Create Categories' },
  { module: 'categories', slug: 'categories.edit', name: 'Edit Categories' },
  { module: 'categories', slug: 'categories.delete', name: 'Delete Categories' },

  // Orders
  { module: 'orders', slug: 'orders.view', name: 'View Orders' },
  { module: 'orders', slug: 'orders.update_status', name: 'Update Order Status' },
  { module: 'orders', slug: 'orders.cancel', name: 'Cancel Orders' },
  { module: 'orders', slug: 'orders.refund', name: 'Process Refunds' },
  { module: 'orders', slug: 'orders.export', name: 'Export Orders' },

  // Customers
  { module: 'customers', slug: 'customers.view', name: 'View Customers' },
  { module: 'customers', slug: 'customers.edit', name: 'Edit Customers' },
  { module: 'customers', slug: 'customers.delete', name: 'Delete Customers' },

  // Discounts
  { module: 'discounts', slug: 'discounts.view', name: 'View Discounts' },
  { module: 'discounts', slug: 'discounts.create', name: 'Create Discounts' },
  { module: 'discounts', slug: 'discounts.edit', name: 'Edit Discounts' },
  { module: 'discounts', slug: 'discounts.delete', name: 'Delete Discounts' },

  // Analytics
  { module: 'analytics', slug: 'analytics.view_sales', name: 'View Sales Analytics' },
  { module: 'analytics', slug: 'analytics.view_customers', name: 'View Customer Analytics' },
  { module: 'analytics', slug: 'analytics.export', name: 'Export Reports' },

  // Staff
  { module: 'staff', slug: 'staff.view', name: 'View Staff' },
  { module: 'staff', slug: 'staff.invite', name: 'Invite Staff' },
  { module: 'staff', slug: 'staff.edit', name: 'Edit Staff' },
  { module: 'staff', slug: 'staff.remove', name: 'Remove Staff' },

  // Roles
  { module: 'roles', slug: 'roles.view', name: 'View Roles' },
  { module: 'roles', slug: 'roles.create', name: 'Create Roles' },
  { module: 'roles', slug: 'roles.edit', name: 'Edit Roles' },
  { module: 'roles', slug: 'roles.delete', name: 'Delete Roles' },

  // Settings
  { module: 'settings', slug: 'settings.view', name: 'View Settings' },
  { module: 'settings', slug: 'settings.general', name: 'Manage General Settings' },
  { module: 'settings', slug: 'settings.payments', name: 'Manage Payment Settings' },
  { module: 'settings', slug: 'settings.shipping', name: 'Manage Shipping Settings' },
  { module: 'settings', slug: 'settings.notifications', name: 'Manage Notification Settings' },
];

// Default roles created for each tenant
export const DEFAULT_TENANT_ROLES = [
  {
    name: 'Owner',
    slug: 'owner',
    description: 'Full access to everything',
    isSystem: true,
    permissions: ['*'],  // All permissions
  },
  {
    name: 'Manager',
    slug: 'manager',
    description: 'Can manage products, orders, and customers',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'products.*',
      'categories.*',
      'orders.*',
      'customers.view',
      'customers.edit',
      'discounts.*',
      'analytics.*',
      'staff.view',
    ],
  },
  {
    name: 'Sales Staff',
    slug: 'sales',
    description: 'Can view and process orders',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'products.view',
      'orders.view',
      'orders.update_status',
      'customers.view',
    ],
  },
  {
    name: 'Inventory Staff',
    slug: 'inventory',
    description: 'Can manage product inventory',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'products.view',
      'products.edit',
      'products.manage_inventory',
      'categories.view',
    ],
  },
];
```

### 2.3 Provider Interfaces (Based on Partyvest Patterns)

```typescript
// ===========================================
// PAYMENT PROVIDER INTERFACE
// ===========================================
export interface IPaymentProvider {
  readonly name: string;
  readonly supportedCurrencies: string[];

  // Bank operations
  getBankList(): Promise<Array<{ name: string; code: string; country: string }>>;
  verifyAccountNumber(bankCode: string, accountNumber: string): Promise<{
    accountName: string;
    accountNumber: string;
    bankCode: string;
  }>;

  // Payment collection
  initializePayment(options: {
    amount: number;
    currency: string;
    email: string;
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  }>;

  verifyPayment(reference: string): Promise<{
    status: 'success' | 'failed' | 'pending';
    amount: number;
    reference: string;
    paidAt?: string;
    channel?: string;
    metadata?: Record<string, any>;
  }>;

  // Transfer/Payout
  initiateTransfer(options: {
    amount: number;
    recipientCode: string;
    reference: string;
    reason?: string;
  }): Promise<{
    transferCode: string;
    reference: string;
    status: string;
  }>;

  checkTransferStatus(reference: string): Promise<{
    status: 'success' | 'failed' | 'pending' | 'reversed';
    amount: number;
    reference: string;
  }>;

  // Virtual accounts
  createVirtualAccount?(options: {
    customerEmail: string;
    customerName: string;
    preferredBank?: string;
    isDisposable?: boolean;
    expiresAt?: Date;
  }): Promise<{
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
    reference: string;
  }>;

  // Refunds
  createRefund?(paymentReference: string, amount?: number): Promise<{
    refundId: string;
    status: string;
    amount: number;
  }>;

  // Webhook
  verifyWebhookSignature(payload: Buffer | string, signature: string): boolean;
}

// ===========================================
// EMAIL PROVIDER INTERFACE
// ===========================================
export interface IEmailProvider {
  readonly name: string;

  send(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: { email: string; name: string };
    replyTo?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
    tags?: string[];
  }): Promise<{
    messageId: string;
    status: 'sent' | 'queued' | 'failed';
  }>;

  sendTemplate?(options: {
    to: string | string[];
    templateId: string;
    variables: Record<string, any>;
    from?: { email: string; name: string };
  }): Promise<{
    messageId: string;
    status: 'sent' | 'queued' | 'failed';
  }>;

  // Verify domain/sender (optional)
  verifyDomain?(domain: string): Promise<{
    verified: boolean;
    dnsRecords?: Array<{ type: string; name: string; value: string }>;
  }>;
}

// ===========================================
// SMS PROVIDER INTERFACE
// ===========================================
export interface ISmsProvider {
  readonly name: string;
  readonly supportedCountries: string[];

  send(options: {
    to: string;
    message: string;
    senderId?: string;
    type?: 'plain' | 'unicode';
  }): Promise<{
    messageId: string;
    status: 'sent' | 'queued' | 'failed';
    cost?: number;
  }>;

  sendBulk?(options: {
    recipients: string[];
    message: string;
    senderId?: string;
  }): Promise<{
    batchId: string;
    status: string;
    successCount: number;
    failedCount: number;
  }>;

  getDeliveryStatus?(messageId: string): Promise<{
    status: 'delivered' | 'sent' | 'failed' | 'pending';
    deliveredAt?: string;
  }>;

  // OTP specific
  sendOtp?(options: {
    to: string;
    length?: number;
    expiresIn?: number; // seconds
    channel?: 'sms' | 'voice' | 'whatsapp';
  }): Promise<{
    pinId: string;
    status: string;
  }>;

  verifyOtp?(pinId: string, pin: string): Promise<{
    verified: boolean;
    msisdn?: string;
  }>;
}
```

### 2.4 Provider Adapters with Retry Logic

```typescript
// Base HTTP client with retry (from Partyvest pattern)
export abstract class BaseProviderClient {
  protected client: AxiosInstance;
  protected maxRetries = 3;
  protected retryDelay = 1000;

  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = this.maxRetries,
    delay = this.retryDelay
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0 || !this.isRetryableError(error)) {
        throw error;
      }

      await this.sleep(delay);
      return this.retryWithBackoff(fn, retries - 1, delay * 2);
    }
  }

  private isRetryableError(error: any): boolean {
    if (error.code === 'ECONNABORTED') return true; // Timeout
    if (error.code === 'ENOTFOUND') return true;    // DNS
    if (error.response?.status >= 500) return true;  // Server error
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 2.5 Payment Provider Implementations

```
backend-template/src/modules/provider/payment/adapters/
├── base-payment.adapter.ts       # Abstract base with common logic
├── paystack.adapter.ts           # Paystack implementation
├── flutterwave.adapter.ts        # Flutterwave implementation
├── stripe.adapter.ts             # Stripe implementation
├── paypal.adapter.ts             # PayPal implementation
├── square.adapter.ts             # Square implementation
└── razorpay.adapter.ts           # Razorpay implementation
```

```typescript
// paystack.adapter.ts (example)
@injectable()
export class PaystackAdapter extends BaseProviderClient implements IPaymentProvider {
  readonly name = 'paystack';
  readonly supportedCurrencies = ['NGN', 'GHS', 'ZAR', 'USD'];

  constructor(private credentials: PaystackCredentials) {
    super();
    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${credentials.secretKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async getBankList(): Promise<Array<{ name: string; code: string; country: string }>> {
    return this.retryWithBackoff(async () => {
      const response = await this.client.get('/bank?currency=NGN');
      return response.data.data.map((bank: any) => ({
        name: bank.name,
        code: bank.code,
        country: 'NG',
      }));
    });
  }

  async verifyAccountNumber(bankCode: string, accountNumber: string) {
    return this.retryWithBackoff(async () => {
      const response = await this.client.get(
        `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
      );
      return {
        accountName: response.data.data.account_name,
        accountNumber: response.data.data.account_number,
        bankCode,
      };
    });
  }

  async initializePayment(options: { amount: number; currency: string; email: string; reference: string }) {
    const response = await this.client.post('/transaction/initialize', {
      amount: options.amount * 100, // Convert to kobo
      email: options.email,
      reference: options.reference,
      currency: options.currency,
    });

    return {
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    };
  }

  verifyWebhookSignature(payload: Buffer | string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.credentials.secretKey)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }

  // ... other methods
}
```

### 2.6 Webhook Event Handling (From Partyvest Pattern)

```typescript
// Webhook event types for routing
export enum PaystackWebhookEvent {
  CHARGE_SUCCESS = 'charge.success',
  TRANSFER_SUCCESS = 'transfer.success',
  TRANSFER_FAILED = 'transfer.failed',
  TRANSFER_REVERSED = 'transfer.reversed',
  REFUND_PROCESSED = 'refund.processed',
  SUBSCRIPTION_CREATE = 'subscription.create',
  SUBSCRIPTION_DISABLE = 'subscription.disable',
  INVOICE_CREATE = 'invoice.create',
  INVOICE_PAYMENT_FAILED = 'invoice.payment_failed',
  DEDICATED_ACCOUNT_ASSIGN_SUCCESS = 'dedicatedaccount.assign.success',
}

// Webhook service with event routing
@injectable()
export class PaystackWebhookService {
  constructor(
    private orderService: OrderService,
    private payoutService: PayoutService,
    private notificationService: NotificationService,
  ) {}

  async handleWebhook(payload: any, signature: string): Promise<void> {
    // Verify signature first
    if (!this.verifySignature(JSON.stringify(payload), signature)) {
      throw new AppError('Invalid webhook signature', 401);
    }

    const { event, data } = payload;

    // Route to appropriate handler
    switch (event) {
      case PaystackWebhookEvent.CHARGE_SUCCESS:
        await this.handleChargeSuccess(data);
        break;
      case PaystackWebhookEvent.TRANSFER_SUCCESS:
        await this.handleTransferSuccess(data);
        break;
      case PaystackWebhookEvent.TRANSFER_FAILED:
        await this.handleTransferFailed(data);
        break;
      // ... other events
    }
  }

  private async handleChargeSuccess(data: any): Promise<void> {
    const { reference, amount, metadata } = data;

    // Idempotency check - don't process same reference twice
    const existing = await this.orderService.findByPaymentReference(reference);
    if (existing?.paymentStatus === 'paid') {
      logger.info('Payment already processed', { reference });
      return;
    }

    // Process based on metadata.serviceId (routing to correct module)
    switch (metadata?.serviceId) {
      case 'checkout':
        await this.orderService.confirmPayment(metadata.orderId, reference);
        break;
      case 'subscription':
        await this.subscriptionService.activateSubscription(metadata.subscriptionId);
        break;
    }

    // Send notification
    await this.notificationService.sendPaymentConfirmation(metadata.userId, {
      amount: amount / 100,
      reference,
    });
  }
}
```

### 2.7 Notification System Architecture (From Partyvest Pattern)

```typescript
// Notification with throttling and batching
export interface NotificationThrottleConfig {
  mode: 'immediate' | 'hourly' | 'daily';
  maxPerWindow: number;
  batchSize: number;
}

// Notification types
export enum NotificationType {
  // Order notifications
  ORDER_CONFIRMATION = 'order_confirmation',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',

  // Payment notifications
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_PROCESSED = 'refund_processed',

  // Account notifications
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  STAFF_INVITATION = 'staff_invitation',

  // Inventory notifications
  LOW_STOCK_ALERT = 'low_stock_alert',
  OUT_OF_STOCK = 'out_of_stock',
}

// Notification service with multi-channel support
@injectable()
export class NotificationService {
  constructor(
    private emailProviderFactory: EmailProviderFactory,
    private smsProviderFactory: SmsProviderFactory,
    private templateService: NotificationTemplateService,
    private notificationRepo: NotificationRepository,
  ) {}

  async send(options: {
    tenantId: string;
    userId?: string;
    type: NotificationType;
    channels: ('email' | 'sms' | 'push')[];
    recipient: { email?: string; phone?: string; deviceToken?: string };
    variables: Record<string, any>;
  }): Promise<void> {
    const { tenantId, type, channels, recipient, variables } = options;

    // Get tenant's configured providers
    const emailProvider = await this.emailProviderFactory.getProvider(tenantId);
    const smsProvider = await this.smsProviderFactory.getProvider(tenantId);

    // Get templates for this notification type
    const templates = await this.templateService.getTemplates(tenantId, type);

    // Send via each channel
    for (const channel of channels) {
      try {
        if (channel === 'email' && recipient.email && emailProvider) {
          const template = templates.find(t => t.channel === 'email');
          if (template) {
            const rendered = this.renderTemplate(template.body, variables);
            await emailProvider.send({
              to: recipient.email,
              subject: this.renderTemplate(template.subject!, variables),
              html: rendered,
            });
          }
        }

        if (channel === 'sms' && recipient.phone && smsProvider) {
          const template = templates.find(t => t.channel === 'sms');
          if (template) {
            const rendered = this.renderTemplate(template.body, variables);
            await smsProvider.send({
              to: recipient.phone,
              message: rendered,
            });
          }
        }

        // Log notification
        await this.notificationRepo.create({
          tenant_id: tenantId,
          user_id: options.userId,
          type,
          channel,
          status: 'sent',
          recipient: recipient[channel === 'email' ? 'email' : 'phone'],
        });
      } catch (error) {
        logger.error('Notification failed', { channel, type, error });
        await this.notificationRepo.create({
          tenant_id: tenantId,
          user_id: options.userId,
          type,
          channel,
          status: 'failed',
          error: error.message,
        });
      }
    }
  }

  private renderTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
  }
}
```

### 2.8 Provider Factory Pattern

```typescript
// Factory for dynamically loading tenant's configured provider
@injectable()
export class PaymentProviderFactory {
  private providers: Map<string, IPaymentProvider> = new Map();

  constructor(
    private tenantPaymentProviderRepo: TenantPaymentProviderRepository,
    private encryptionService: EncryptionService,
  ) {}

  async getProvider(tenantId: string): Promise<IPaymentProvider | null> {
    // Check cache first
    const cacheKey = `payment:${tenantId}`;
    if (this.providers.has(cacheKey)) {
      return this.providers.get(cacheKey)!;
    }

    // Get tenant's active payment provider config
    const config = await this.tenantPaymentProviderRepo.findActive(tenantId);
    if (!config) {
      return null;
    }

    // Decrypt credentials
    const credentials = this.encryptionService.decrypt(config.credentials);

    // Instantiate correct adapter
    let provider: IPaymentProvider;

    switch (config.provider) {
      case 'paystack':
        provider = new PaystackAdapter(credentials as PaystackCredentials);
        break;
      case 'stripe':
        provider = new StripeAdapter(credentials as StripeCredentials);
        break;
      case 'flutterwave':
        provider = new FlutterwaveAdapter(credentials as FlutterwaveCredentials);
        break;
      case 'paypal':
        provider = new PaypalAdapter(credentials as PaypalCredentials);
        break;
      default:
        throw new AppError(`Unknown payment provider: ${config.provider}`);
    }

    // Cache for future requests
    this.providers.set(cacheKey, provider);

    return provider;
  }

  // Invalidate cache when provider config changes
  invalidateCache(tenantId: string): void {
    this.providers.delete(`payment:${tenantId}`);
  }
}
```

### 2.9 Transaction & Payout Tracking (From Partyvest Pattern)

```typescript
// Transaction tracking with status state machine
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum TransactionType {
  PAYMENT = 'payment',           // Customer payment
  PAYOUT = 'payout',             // Withdrawal to bank
  REFUND = 'refund',             // Refund to customer
  TRANSFER = 'transfer',         // Internal transfer
  ADJUSTMENT = 'adjustment',     // Manual adjustment
}

export enum TransactionDirection {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

// Payout tracking for settlements
export enum PayoutStatus {
  PENDING = 'pending',           // Awaiting processing
  PROCESSING = 'processing',     // Being processed
  SETTLED = 'settled',           // Funds transferred
  FAILED = 'failed',             // Transfer failed
  REVERSED = 'reversed',         // Reversed after settlement
  ON_HOLD = 'on_hold',           // Held for review
}

// Service for managing payouts
@injectable()
export class PayoutService {
  async createPayout(options: {
    tenantId: string;
    orderId: string;
    amount: number;
    fee: number;
    netAmount: number;
    paymentReference: string;
    paymentChannel: string;
  }): Promise<Payout> {
    return this.payoutRepo.create({
      id: uuidv4(),
      tenant_id: options.tenantId,
      order_id: options.orderId,
      amount: options.amount,
      fee: options.fee,
      net_amount: options.netAmount,
      payment_reference: options.paymentReference,
      payment_channel: options.paymentChannel,
      status: PayoutStatus.PENDING,
    });
  }

  async processSettlement(tenantId: string): Promise<void> {
    // Get all pending payouts for tenant
    const pendingPayouts = await this.payoutRepo.findPendingByTenant(tenantId);

    // Get tenant's bank account details
    const bankAccount = await this.tenantBankAccountRepo.findByTenant(tenantId);
    if (!bankAccount) {
      throw new AppError('No bank account configured');
    }

    // Get payment provider
    const provider = await this.paymentProviderFactory.getProvider(tenantId);

    // Process each payout
    for (const payout of pendingPayouts) {
      try {
        await this.payoutRepo.updateStatus(payout.id, PayoutStatus.PROCESSING);

        const transfer = await provider.initiateTransfer({
          amount: payout.net_amount,
          recipientCode: bankAccount.recipient_code,
          reference: `PAYOUT-${payout.id}`,
          reason: `Settlement for order ${payout.order_id}`,
        });

        await this.payoutRepo.update(payout.id, {
          status: PayoutStatus.SETTLED,
          transfer_reference: transfer.reference,
          settled_at: new Date(),
        });
      } catch (error) {
        await this.payoutRepo.update(payout.id, {
          status: PayoutStatus.FAILED,
          error_message: error.message,
        });
      }
    }
  }
}
```

---

## Part 3: Tenant Admin Dashboard (Frontend)

### 3.1 Directory Structure

```
frontend-template/src/app/admin/
├── layout.tsx                    # Admin layout with sidebar
├── page.tsx                      # Dashboard home
│
├── products/
│   ├── page.tsx                  # Products list
│   ├── new/page.tsx              # Create product
│   └── [id]/
│       ├── page.tsx              # Edit product
│       └── variants/page.tsx     # Manage variants
│
├── categories/
│   ├── page.tsx                  # Categories list/tree
│   └── [id]/page.tsx             # Edit category
│
├── orders/
│   ├── page.tsx                  # Orders list
│   └── [id]/page.tsx             # Order details
│
├── customers/
│   ├── page.tsx                  # Customers list
│   └── [id]/page.tsx             # Customer details
│
├── discounts/
│   ├── page.tsx                  # Discounts list
│   ├── new/page.tsx              # Create discount
│   └── [id]/page.tsx             # Edit discount
│
├── analytics/
│   ├── page.tsx                  # Overview
│   ├── sales/page.tsx            # Sales reports
│   └── customers/page.tsx        # Customer insights
│
├── staff/
│   ├── page.tsx                  # Staff list
│   ├── invite/page.tsx           # Invite staff
│   └── [id]/page.tsx             # Edit staff member
│
├── roles/
│   ├── page.tsx                  # Roles list
│   ├── new/page.tsx              # Create role
│   └── [id]/page.tsx             # Edit role permissions
│
└── settings/
    ├── page.tsx                  # General settings
    ├── store/page.tsx            # Store settings
    ├── payments/page.tsx         # Payment providers
    ├── shipping/page.tsx         # Shipping settings
    ├── notifications/page.tsx    # Email/SMS settings
    └── domains/page.tsx          # Custom domain
```

### 3.2 Key Admin Components

```
frontend-template/src/components/admin/
├── layout/
│   ├── admin-sidebar.tsx         # Navigation sidebar
│   ├── admin-header.tsx          # Top bar with user menu
│   └── admin-breadcrumb.tsx
│
├── dashboard/
│   ├── stats-cards.tsx           # Revenue, orders, etc.
│   ├── recent-orders.tsx
│   ├── sales-chart.tsx
│   └── top-products.tsx
│
├── products/
│   ├── product-form.tsx          # Create/edit form
│   ├── product-table.tsx
│   ├── variant-manager.tsx       # Manage sizes/colors
│   ├── inventory-editor.tsx
│   └── media-uploader.tsx
│
├── orders/
│   ├── order-table.tsx
│   ├── order-details.tsx
│   ├── order-timeline.tsx
│   ├── order-status-badge.tsx
│   └── refund-dialog.tsx
│
├── staff/
│   ├── staff-table.tsx
│   ├── invite-form.tsx
│   └── role-selector.tsx
│
├── roles/
│   ├── role-form.tsx
│   └── permission-matrix.tsx     # Checkbox grid for permissions
│
├── settings/
│   ├── provider-card.tsx         # Payment/email/SMS provider
│   ├── provider-config-form.tsx
│   └── domain-settings.tsx
│
└── shared/
    ├── data-table.tsx            # Reusable table with sorting/filtering
    ├── stat-card.tsx
    ├── chart-wrapper.tsx
    ├── permission-guard.tsx      # Wraps components that need permission
    └── audit-log-viewer.tsx
```

### 3.3 Permission Guard Component

```tsx
// components/admin/shared/permission-guard.tsx
'use client';

import { usePermissions } from '@/lib/hooks/use-permissions';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  permission: string | string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permission,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = permissions.some(p => hasPermission(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage example:
// <PermissionGuard permission="orders.refund">
//   <RefundButton orderId={order.id} />
// </PermissionGuard>
```

---

## Part 4: Platform Super Admin Dashboard

### 4.1 Directory Structure

```
platform-admin/                   # Separate Next.js app
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Platform dashboard
│   │   │
│   │   ├── auth/
│   │   │   └── login/page.tsx
│   │   │
│   │   ├── tenants/
│   │   │   ├── page.tsx          # All tenants list
│   │   │   ├── new/page.tsx      # Onboard new tenant
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Tenant overview
│   │   │       ├── settings/page.tsx
│   │   │       ├── providers/page.tsx    # Configure providers
│   │   │       ├── subscription/page.tsx
│   │   │       └── audit/page.tsx        # Tenant activity log
│   │   │
│   │   ├── plans/
│   │   │   ├── page.tsx          # Subscription plans
│   │   │   └── [id]/page.tsx     # Edit plan
│   │   │
│   │   ├── providers/
│   │   │   ├── page.tsx          # Global provider settings
│   │   │   ├── payment/page.tsx  # Available payment providers
│   │   │   ├── email/page.tsx    # Available email providers
│   │   │   └── sms/page.tsx      # Available SMS providers
│   │   │
│   │   ├── templates/
│   │   │   ├── page.tsx          # Template types
│   │   │   └── [type]/page.tsx   # Configure template
│   │   │
│   │   ├── admins/
│   │   │   ├── page.tsx          # Platform admins
│   │   │   └── [id]/page.tsx     # Edit admin
│   │   │
│   │   ├── analytics/
│   │   │   ├── page.tsx          # Platform overview
│   │   │   ├── revenue/page.tsx  # Platform revenue
│   │   │   └── growth/page.tsx   # Tenant growth
│   │   │
│   │   └── audit/
│   │       └── page.tsx          # Platform audit log
│   │
│   ├── components/
│   │   ├── tenants/
│   │   │   ├── tenant-table.tsx
│   │   │   ├── onboarding-wizard.tsx
│   │   │   ├── tenant-details.tsx
│   │   │   └── provider-configurator.tsx
│   │   │
│   │   ├── plans/
│   │   │   ├── plan-card.tsx
│   │   │   └── plan-form.tsx
│   │   │
│   │   └── analytics/
│   │       ├── platform-stats.tsx
│   │       ├── revenue-chart.tsx
│   │       └── tenant-growth-chart.tsx
│   │
│   └── lib/
│       └── api/
│           └── platform-client.ts
│
├── package.json
└── next.config.js
```

### 4.2 Tenant Onboarding Wizard

```tsx
// Steps for onboarding a new tenant
const ONBOARDING_STEPS = [
  {
    id: 'business-info',
    title: 'Business Information',
    fields: ['name', 'slug', 'templateType', 'contactEmail', 'contactPhone'],
  },
  {
    id: 'owner-account',
    title: 'Owner Account',
    fields: ['ownerEmail', 'ownerFirstName', 'ownerLastName', 'sendInvite'],
  },
  {
    id: 'subscription',
    title: 'Subscription Plan',
    fields: ['planId', 'billingCycle', 'trialDays'],
  },
  {
    id: 'payment-provider',
    title: 'Payment Provider',
    fields: ['paymentProvider', 'providerCredentials'],
  },
  {
    id: 'notification-providers',
    title: 'Notification Providers',
    fields: ['emailProvider', 'smsProvider'],
  },
  {
    id: 'review',
    title: 'Review & Create',
    fields: [],
  },
];
```

### 4.3 Provider Configuration UI

```tsx
// components/tenants/provider-configurator.tsx
interface ProviderConfig {
  payment: {
    available: ['stripe', 'paypal', 'square', 'razorpay', 'flutterwave'];
    fields: {
      stripe: ['secretKey', 'publishableKey', 'webhookSecret'];
      paypal: ['clientId', 'clientSecret', 'mode'];
      // etc.
    };
  };
  email: {
    available: ['sendgrid', 'mailgun', 'ses', 'postmark', 'smtp'];
    fields: {
      sendgrid: ['apiKey'];
      mailgun: ['apiKey', 'domain'];
      smtp: ['host', 'port', 'username', 'password', 'encryption'];
      // etc.
    };
  };
  sms: {
    available: ['twilio', 'nexmo', 'africastalking', 'termii'];
    fields: {
      twilio: ['accountSid', 'authToken', 'fromNumber'];
      // etc.
    };
  };
}
```

---

## Part 5: API Endpoints

### 5.1 Tenant Admin API Endpoints

```
# Staff Management
GET    /api/v1/admin/staff                    # List staff members
POST   /api/v1/admin/staff/invite             # Invite new staff
DELETE /api/v1/admin/staff/:id                # Remove staff member
PATCH  /api/v1/admin/staff/:id/roles          # Update staff roles

# Role Management
GET    /api/v1/admin/roles                    # List roles
POST   /api/v1/admin/roles                    # Create custom role
GET    /api/v1/admin/roles/:id                # Get role with permissions
PATCH  /api/v1/admin/roles/:id                # Update role
DELETE /api/v1/admin/roles/:id                # Delete role (if not system)

# Permissions
GET    /api/v1/admin/permissions              # List all permissions

# Provider Configuration
GET    /api/v1/admin/settings/providers/payment
POST   /api/v1/admin/settings/providers/payment/:provider
PATCH  /api/v1/admin/settings/providers/payment/:provider
DELETE /api/v1/admin/settings/providers/payment/:provider
POST   /api/v1/admin/settings/providers/payment/:provider/test  # Test connection

GET    /api/v1/admin/settings/providers/email
POST   /api/v1/admin/settings/providers/email/:provider
POST   /api/v1/admin/settings/providers/email/:provider/test

GET    /api/v1/admin/settings/providers/sms
POST   /api/v1/admin/settings/providers/sms/:provider
POST   /api/v1/admin/settings/providers/sms/:provider/test

# Notification Templates
GET    /api/v1/admin/notifications/templates
GET    /api/v1/admin/notifications/templates/:type
PATCH  /api/v1/admin/notifications/templates/:type
POST   /api/v1/admin/notifications/templates/:type/preview

# Analytics
GET    /api/v1/admin/analytics/overview       # Dashboard stats
GET    /api/v1/admin/analytics/sales          # Sales data
GET    /api/v1/admin/analytics/products       # Product performance
GET    /api/v1/admin/analytics/customers      # Customer insights

# Audit Log
GET    /api/v1/admin/audit-log                # Activity log
```

### 5.2 Platform Admin API Endpoints

```
# Platform Auth
POST   /api/v1/platform/auth/login
POST   /api/v1/platform/auth/logout
GET    /api/v1/platform/auth/me

# Tenant Management
GET    /api/v1/platform/tenants               # List all tenants
POST   /api/v1/platform/tenants               # Create/onboard tenant
GET    /api/v1/platform/tenants/:id           # Tenant details
PATCH  /api/v1/platform/tenants/:id           # Update tenant
DELETE /api/v1/platform/tenants/:id           # Soft delete tenant
POST   /api/v1/platform/tenants/:id/suspend   # Suspend tenant
POST   /api/v1/platform/tenants/:id/activate  # Activate tenant

# Tenant Provider Configuration (by platform admin)
GET    /api/v1/platform/tenants/:id/providers
POST   /api/v1/platform/tenants/:id/providers/payment/:provider
POST   /api/v1/platform/tenants/:id/providers/email/:provider
POST   /api/v1/platform/tenants/:id/providers/sms/:provider

# Subscription Plans
GET    /api/v1/platform/plans
POST   /api/v1/platform/plans
PATCH  /api/v1/platform/plans/:id
DELETE /api/v1/platform/plans/:id

# Tenant Subscriptions
GET    /api/v1/platform/tenants/:id/subscription
POST   /api/v1/platform/tenants/:id/subscription
PATCH  /api/v1/platform/tenants/:id/subscription

# Platform Admins
GET    /api/v1/platform/admins
POST   /api/v1/platform/admins
PATCH  /api/v1/platform/admins/:id
DELETE /api/v1/platform/admins/:id

# Platform Analytics
GET    /api/v1/platform/analytics/overview    # Total tenants, revenue, etc.
GET    /api/v1/platform/analytics/revenue     # Platform revenue
GET    /api/v1/platform/analytics/growth      # Tenant growth

# Audit Log
GET    /api/v1/platform/audit-log

# Templates Configuration
GET    /api/v1/platform/templates             # List template types
GET    /api/v1/platform/templates/:type       # Template config
PATCH  /api/v1/platform/templates/:type       # Update template config
```

---

## Part 6: Implementation Order

### Phase 1: Core Infrastructure
1. Database migrations for new tables
2. Roles & permissions backend module
3. Permission middleware
4. Staff management backend

### Phase 2: Provider System
5. Provider interfaces and factory pattern
6. Payment provider adapters (Stripe first, then others)
7. Email provider adapters
8. SMS provider adapters
9. Provider configuration backend

### Phase 3: Tenant Admin Dashboard
10. Admin layout and navigation
11. Dashboard with analytics
12. Products management UI
13. Orders management UI
14. Staff & roles management UI
15. Settings pages (providers, notifications)

### Phase 4: Platform Admin Dashboard
16. Separate Next.js app setup
17. Platform auth system
18. Tenant onboarding wizard
19. Tenant management pages
20. Subscription plans management
21. Platform analytics

### Phase 5: Polish & Testing
22. Audit logging
23. E2E testing for both dashboards
24. Documentation

---

## Part 7: Security Considerations

### 7.1 Permission Checking
- Every API endpoint must verify permissions
- Frontend uses permission guards for UI elements
- API responses exclude unauthorized data

### 7.2 Provider Credentials
- All credentials encrypted at rest using AES-256
- Credentials never exposed in API responses
- Separate encryption keys per tenant

### 7.3 Audit Logging
- All sensitive actions logged
- Log retention policy (90 days default)
- Immutable audit records

### 7.4 Platform Admin Security
- Separate authentication system
- IP allowlisting option
- 2FA required for super admins
- Session timeout (30 minutes)

---

---

## Part 8: Supported Providers

### 8.1 Payment Providers

| Provider | Countries | Features | Integration Complexity |
|----------|-----------|----------|----------------------|
| **Paystack** | NG, GH, ZA, KE | Cards, Bank Transfer, USSD, Mobile Money, Virtual Accounts | Medium |
| **Flutterwave** | NG, GH, KE, ZA, UG, TZ, RW + 30 more | Cards, Bank, Mobile Money, USSD, Barter | Medium |
| **Stripe** | 40+ countries | Cards, Bank, Apple/Google Pay, Buy Now Pay Later | Easy |
| **PayPal** | 200+ countries | PayPal Balance, Cards, Pay Later | Easy |
| **Square** | US, CA, UK, AU, JP | Cards, Cash App, Afterpay | Medium |
| **Razorpay** | IN | Cards, UPI, Netbanking, Wallets | Medium |
| **PiggyVest Business** | NG | Wallets, Virtual Accounts, Interest, P2P | Medium |

### 8.2 Email Providers

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| **SendGrid** | 100/day | High volume transactional |
| **Mailgun** | 5,000/month (3 months) | Developers, API-first |
| **AWS SES** | 62,000/month (from EC2) | AWS users, cost-effective |
| **Postmark** | 100/month | Deliverability focused |
| **Zeptomail** | Pay as you go | Zoho ecosystem |
| **SMTP** | Depends on provider | Self-hosted, Gmail, etc. |

### 8.3 SMS Providers

| Provider | Coverage | Features |
|----------|----------|----------|
| **Twilio** | Global | SMS, Voice, WhatsApp, Verify |
| **Nexmo/Vonage** | Global | SMS, Voice, Verify, WhatsApp |
| **Africa's Talking** | Africa | SMS, Voice, USSD, Airtime |
| **Termii** | NG, Africa | SMS, Voice, WhatsApp, OTP |
| **Cydene** | NG | SMS, OTP |

### 8.4 Provider Configuration Schema

```typescript
// Payment provider credentials (encrypted)
interface PaystackCredentials {
  secretKey: string;
  publicKey: string;
  webhookSecret?: string;
}

interface StripeCredentials {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  accountId?: string; // For Connect
}

interface FlutterwaveCredentials {
  secretKey: string;
  publicKey: string;
  encryptionKey: string;
  webhookSecret?: string;
}

// Email provider credentials
interface SendGridCredentials {
  apiKey: string;
}

interface MailgunCredentials {
  apiKey: string;
  domain: string;
  region?: 'us' | 'eu';
}

interface SmtpCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'tls' | 'ssl' | 'none';
}

// SMS provider credentials
interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface TermiiCredentials {
  apiKey: string;
  senderId: string;
}
```

---

## Summary

### Dashboards Overview

| Dashboard | Purpose | Users |
|-----------|---------|-------|
| Tenant Admin | Manage store, staff, inventory, orders | Business owners & their staff |
| Platform Admin | Onboard tenants, configure providers, manage subscriptions | Platform operators |

### Feature Matrix

| Feature | Tenant Admin | Platform Admin |
|---------|--------------|----------------|
| Products CRUD | ✓ | - |
| Orders Management | ✓ | View only |
| Staff Management | ✓ | - |
| Role/Permission Config | ✓ (limited) | ✓ (full) |
| Payment Providers | View & test | Configure |
| Email/SMS Providers | View & test | Configure |
| Subscription | View | Manage |
| Tenant Onboarding | - | ✓ |
| Platform Analytics | - | ✓ |

### Architecture Patterns Used

| Pattern | Purpose |
|---------|---------|
| **Adapter Pattern** | Unified interface for different providers |
| **Factory Pattern** | Dynamic provider instantiation based on tenant config |
| **Strategy Pattern** | Swappable payment/notification strategies |
| **Repository Pattern** | Data access abstraction |
| **Dependency Injection** | Loose coupling via tsyringe |
| **Middleware Pattern** | Request processing pipeline |
| **Event-Driven** | Webhook processing, notifications |
| **Retry with Backoff** | Resilient external API calls |

### Key Security Features

| Feature | Implementation |
|---------|----------------|
| Credential Encryption | AES-256 at rest |
| Webhook Verification | HMAC-SHA512 signatures |
| Permission Checking | Middleware + UI guards |
| Audit Logging | All sensitive actions logged |
| Rate Limiting | Per-tenant API limits |
| Session Management | JWT with refresh tokens |

---

## Part 9: Additional Features

### 9.1 Bulk Operations

```typescript
// Bulk product import/export
POST /api/v1/admin/products/import     // CSV/Excel upload
GET  /api/v1/admin/products/export     // Export to CSV
POST /api/v1/admin/products/bulk       // Bulk update (price, stock, status)

// Bulk order operations
POST /api/v1/admin/orders/bulk/status  // Update multiple order statuses
POST /api/v1/admin/orders/bulk/export  // Export orders to CSV
```

### 9.2 Tax Configuration

```sql
CREATE TABLE tax_rates (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,          -- "VAT", "Sales Tax"
  rate DECIMAL(5,2) NOT NULL,          -- 7.50 for 7.5%
  country VARCHAR(2),                   -- ISO country code
  state VARCHAR(100),                   -- State/province
  postal_code_pattern VARCHAR(50),      -- Regex for zip codes
  is_compound BOOLEAN DEFAULT FALSE,    -- Tax on tax
  is_shipping_taxable BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,           -- Order of application
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tax_exemptions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  customer_id UUID REFERENCES users(id),
  tax_rate_id UUID REFERENCES tax_rates(id),
  exemption_number VARCHAR(100),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.3 Shipping Zones & Methods

```sql
CREATE TABLE shipping_zones (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,           -- "Domestic", "International"
  countries JSONB DEFAULT '[]',         -- ["US", "CA"]
  states JSONB DEFAULT '[]',            -- ["NY", "CA"]
  postal_codes JSONB DEFAULT '[]',      -- Specific codes or patterns
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  zone_id UUID REFERENCES shipping_zones(id),
  name VARCHAR(100) NOT NULL,           -- "Standard Shipping"
  description TEXT,
  calculation_type VARCHAR(20),         -- "flat", "weight", "price", "item"
  base_rate DECIMAL(10,2),
  per_kg_rate DECIMAL(10,2),
  per_item_rate DECIMAL(10,2),
  free_shipping_threshold DECIMAL(10,2),
  min_order_amount DECIMAL(10,2),
  max_order_amount DECIMAL(10,2),
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.4 Inventory Alerts & Automation

```sql
CREATE TABLE inventory_alerts (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  alert_type VARCHAR(50),               -- "low_stock", "out_of_stock", "restock"
  threshold INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  notify_email BOOLEAN DEFAULT TRUE,
  notify_sms BOOLEAN DEFAULT FALSE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-actions on inventory events
CREATE TABLE inventory_automations (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  trigger_type VARCHAR(50),             -- "low_stock", "out_of_stock"
  action_type VARCHAR(50),              -- "notify", "hide_product", "reorder"
  config JSONB DEFAULT '{}',            -- Action-specific config
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.5 API Keys for Integrations

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,           -- "Mobile App", "POS Integration"
  key_hash VARCHAR(255) NOT NULL,       -- Hashed API key
  key_prefix VARCHAR(10) NOT NULL,      -- First 8 chars for identification
  permissions JSONB DEFAULT '[]',       -- Allowed endpoints/scopes
  rate_limit INTEGER DEFAULT 1000,      -- Requests per hour
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_key_usage (
  id UUID PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  endpoint VARCHAR(255),
  method VARCHAR(10),
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.6 Webhook Management (Outgoing)

```sql
-- Tenant's custom webhooks to their systems
CREATE TABLE tenant_webhooks (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  events JSONB DEFAULT '[]',            -- ["order.created", "order.paid"]
  secret VARCHAR(255),                  -- For signature verification
  headers JSONB DEFAULT '{}',           -- Custom headers
  is_active BOOLEAN DEFAULT TRUE,
  retry_count INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY,
  webhook_id UUID REFERENCES tenant_webhooks(id),
  event_type VARCHAR(100),
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  attempts INTEGER DEFAULT 0,
  delivered_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.7 Customer Segments

```sql
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20),                     -- "static", "dynamic"
  conditions JSONB DEFAULT '[]',        -- For dynamic segments
  customer_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example conditions for dynamic segment:
-- [
--   { "field": "total_spent", "operator": ">=", "value": 1000 },
--   { "field": "orders_count", "operator": ">=", "value": 5 },
--   { "field": "last_order_date", "operator": ">=", "value": "-30days" }
-- ]

CREATE TABLE customer_segment_members (
  id UUID PRIMARY KEY,
  segment_id UUID REFERENCES customer_segments(id),
  customer_id UUID REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(segment_id, customer_id)
);
```

### 9.8 Scheduled Reports

```sql
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  report_type VARCHAR(50),              -- "sales", "inventory", "customers"
  filters JSONB DEFAULT '{}',
  schedule VARCHAR(50),                 -- "daily", "weekly", "monthly"
  schedule_time TIME,                   -- Time to run
  schedule_day INTEGER,                 -- Day of week/month
  recipients JSONB DEFAULT '[]',        -- Email addresses
  format VARCHAR(10) DEFAULT 'csv',     -- "csv", "xlsx", "pdf"
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.9 Store Branding & Theming

```sql
-- Extended tenant settings for branding
ALTER TABLE tenants ADD COLUMN branding JSONB DEFAULT '{}';

-- Branding schema:
-- {
--   "logo": { "light": "url", "dark": "url", "favicon": "url" },
--   "colors": {
--     "primary": "#3b82f6",
--     "secondary": "#10b981",
--     "accent": "#f59e0b",
--     "background": "#ffffff",
--     "text": "#1f2937"
--   },
--   "fonts": {
--     "heading": "Inter",
--     "body": "Open Sans"
--   },
--   "customCss": "/* Custom CSS here */",
--   "socialLinks": {
--     "facebook": "url",
--     "instagram": "url",
--     "twitter": "url",
--     "tiktok": "url"
--   },
--   "footerText": "© 2024 Store Name",
--   "announcementBar": {
--     "enabled": true,
--     "text": "Free shipping on orders over $50!",
--     "link": "/products",
--     "backgroundColor": "#3b82f6"
--   }
-- }
```

### 9.10 Multi-Currency Support

```sql
CREATE TABLE currencies (
  code VARCHAR(3) PRIMARY KEY,          -- "USD", "NGN", "GBP"
  name VARCHAR(100),
  symbol VARCHAR(10),
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY,
  base_currency VARCHAR(3) REFERENCES currencies(code),
  target_currency VARCHAR(3) REFERENCES currencies(code),
  rate DECIMAL(20,10) NOT NULL,
  source VARCHAR(50),                   -- "manual", "api"
  fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant currency settings
CREATE TABLE tenant_currencies (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  currency_code VARCHAR(3) REFERENCES currencies(code),
  is_default BOOLEAN DEFAULT FALSE,
  exchange_rate_markup DECIMAL(5,2) DEFAULT 0,  -- Markup percentage
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(tenant_id, currency_code)
);
```

---

## Part 10: Implementation Phases (Updated)

### Phase 1: Core Infrastructure (Week 1-2)
1. Database migrations for all new tables
2. Roles & permissions system
3. Permission middleware
4. Staff management module

### Phase 2: Provider System (Week 2-3)
5. Provider interfaces and base classes
6. Payment adapters (Paystack, Stripe, Flutterwave)
7. Email adapters (SendGrid, SMTP)
8. SMS adapters (Twilio, Termii)
9. Webhook handlers for each provider
10. Provider factory and configuration

### Phase 3: Tenant Admin Dashboard (Week 3-4)
11. Admin layout and navigation
12. Dashboard with analytics widgets
13. Products management (with bulk operations)
14. Orders management
15. Customers and segments
16. Staff & roles management
17. Settings (providers, shipping, tax, branding)

### Phase 4: Platform Admin Dashboard (Week 4-5)
18. Separate Next.js app setup
19. Platform authentication
20. Tenant onboarding wizard
21. Tenant management pages
22. Provider configuration UI
23. Subscription/billing management
24. Platform analytics

### Phase 5: Advanced Features (Week 5-6)
25. Inventory alerts and automation
26. API keys management
27. Outgoing webhooks
28. Scheduled reports
29. Multi-currency support
30. Import/export functionality

### Phase 6: Polish & Testing (Week 6+)
31. E2E testing for both dashboards
32. Performance optimization
33. Documentation
34. Security audit
