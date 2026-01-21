import { BaseModel } from './Base.model';

export class TenantPaymentProvider extends BaseModel {
  static tableName = 'tenant_payment_providers';

  id!: string;
  tenant_id!: string;
  provider!: string;
  is_active!: boolean;
  is_default!: boolean;
  credentials!: string; // Encrypted
  settings!: Record<string, any>;
  webhook_secret?: string;
  created_at!: string;
  updated_at!: string;
}

export class TenantEmailProvider extends BaseModel {
  static tableName = 'tenant_email_providers';

  id!: string;
  tenant_id!: string;
  provider!: string;
  is_active!: boolean;
  credentials!: string; // Encrypted
  settings!: Record<string, any>;
  created_at!: string;
  updated_at!: string;
}

export class TenantSmsProvider extends BaseModel {
  static tableName = 'tenant_sms_providers';

  id!: string;
  tenant_id!: string;
  provider!: string;
  is_active!: boolean;
  credentials!: string; // Encrypted
  settings!: Record<string, any>;
  created_at!: string;
  updated_at!: string;
}

export class NotificationTemplate extends BaseModel {
  static tableName = 'notification_templates';

  id!: string;
  tenant_id!: string;
  type!: string;
  channel!: 'email' | 'sms';
  subject?: string;
  body!: string;
  variables!: string[];
  is_active!: boolean;
  created_at!: string;
  updated_at!: string;
}

export class Notification extends BaseModel {
  static tableName = 'notifications';

  id!: string;
  tenant_id!: string;
  user_id?: string;
  type!: string;
  channel!: string;
  recipient!: string;
  status!: 'pending' | 'sent' | 'delivered' | 'failed';
  provider?: string;
  provider_message_id?: string;
  error?: string;
  metadata!: Record<string, any>;
  sent_at?: string;
  created_at!: string;
}
