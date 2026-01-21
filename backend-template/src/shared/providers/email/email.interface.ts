/**
 * Email Provider Interface
 * Standardized interface for all email providers (SendGrid, Mailgun, AWS SES, SMTP)
 */

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: 'base64' | 'binary';
  contentId?: string; // For inline images
}

export interface EmailOptions {
  to: EmailAddress | EmailAddress[];
  from?: EmailAddress;
  replyTo?: EmailAddress;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: EmailAttachment[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  headers?: Record<string, string>;
  tags?: string[];
  metadata?: Record<string, any>;
  trackOpens?: boolean;
  trackClicks?: boolean;
  scheduledAt?: Date;
}

export interface EmailSendResult {
  messageId: string;
  provider: string;
  status: 'sent' | 'queued' | 'failed';
  acceptedRecipients?: string[];
  rejectedRecipients?: string[];
  rawResponse?: any;
}

export interface BulkEmailOptions {
  messages: EmailOptions[];
  defaultFrom?: EmailAddress;
  defaultReplyTo?: EmailAddress;
  batchSize?: number;
}

export interface BulkEmailResult {
  totalSent: number;
  totalFailed: number;
  results: Array<{
    to: string;
    messageId?: string;
    status: 'sent' | 'failed';
    error?: string;
  }>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: string[];
}

export interface IEmailProvider {
  readonly name: string;
  readonly supportedFeatures: EmailFeature[];

  /**
   * Send a single email
   */
  sendEmail(options: EmailOptions): Promise<EmailSendResult>;

  /**
   * Send bulk emails
   */
  sendBulkEmails?(options: BulkEmailOptions): Promise<BulkEmailResult>;

  /**
   * Send email using a provider template
   */
  sendTemplateEmail?(
    to: EmailAddress | EmailAddress[],
    templateId: string,
    templateData: Record<string, any>,
    options?: Partial<EmailOptions>
  ): Promise<EmailSendResult>;

  /**
   * Create/update an email template
   */
  createTemplate?(template: EmailTemplate): Promise<EmailTemplate>;

  /**
   * Get email delivery status
   */
  getEmailStatus?(messageId: string): Promise<{
    status: 'delivered' | 'bounced' | 'opened' | 'clicked' | 'spam' | 'unsubscribed' | 'unknown';
    timestamp?: Date;
    details?: any;
  }>;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature?(payload: string, signature: string): boolean;
}

export enum EmailFeature {
  TEMPLATES = 'templates',
  BULK_SEND = 'bulk_send',
  TRACKING = 'tracking',
  ATTACHMENTS = 'attachments',
  SCHEDULING = 'scheduling',
  WEBHOOKS = 'webhooks',
}

export interface EmailProviderConfig {
  apiKey: string;
  domain?: string;
  from?: EmailAddress;
  replyTo?: EmailAddress;
  region?: string;
  baseUrl?: string;
  // SMTP-specific
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  [key: string]: any;
}
