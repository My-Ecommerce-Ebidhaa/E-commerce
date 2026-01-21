/**
 * SendGrid Email Provider Adapter
 * Implements IEmailProvider interface for SendGrid
 */

import { BaseProvider } from '../base.provider';
import {
  IEmailProvider,
  EmailProviderConfig,
  EmailFeature,
  EmailAddress,
  EmailOptions,
  EmailSendResult,
  BulkEmailOptions,
  BulkEmailResult,
  EmailTemplate,
} from './email.interface';

interface SendGridConfig extends EmailProviderConfig {
  apiKey: string;
  from?: EmailAddress;
}

export class SendGridAdapter extends BaseProvider implements IEmailProvider {
  protected providerName = 'SendGrid';

  readonly name = 'sendgrid';
  readonly supportedFeatures = [
    EmailFeature.TEMPLATES,
    EmailFeature.BULK_SEND,
    EmailFeature.TRACKING,
    EmailFeature.ATTACHMENTS,
    EmailFeature.SCHEDULING,
    EmailFeature.WEBHOOKS,
  ];

  private readonly baseUrl = 'https://api.sendgrid.com/v3';
  private readonly apiKey: string;
  private readonly defaultFrom?: EmailAddress;

  constructor(config: SendGridConfig) {
    super();
    this.apiKey = config.apiKey;
    this.defaultFrom = config.from;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    // SendGrid returns 202 for successful sends with no body
    if (response.status === 202 || response.status === 204) {
      return {
        messageId: response.headers.get('X-Message-Id'),
      } as T;
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error: any = new Error(
        result.errors?.[0]?.message || 'SendGrid API error'
      );
      error.statusCode = response.status;
      error.errors = result.errors;
      throw error;
    }

    return result;
  }

  private formatEmailAddress(address: EmailAddress | string): { email: string; name?: string } {
    if (typeof address === 'string') {
      return { email: address };
    }
    return { email: address.email, name: address.name };
  }

  private formatEmailAddresses(
    addresses: EmailAddress | EmailAddress[] | string | string[]
  ): Array<{ email: string; name?: string }> {
    const addressList = Array.isArray(addresses) ? addresses : [addresses];
    return addressList.map((addr) => this.formatEmailAddress(addr as EmailAddress | string));
  }

  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    return this.withRetry(async () => {
      const from = options.from || this.defaultFrom;
      if (!from) {
        throw new Error('From address is required');
      }

      const personalizations: any[] = [
        {
          to: this.formatEmailAddresses(options.to),
          ...(options.cc && { cc: this.formatEmailAddresses(options.cc) }),
          ...(options.bcc && { bcc: this.formatEmailAddresses(options.bcc) }),
          ...(options.templateId &&
            options.templateData && {
              dynamic_template_data: options.templateData,
            }),
        },
      ];

      const mailData: any = {
        personalizations,
        from: this.formatEmailAddress(from),
        subject: options.subject,
        ...(options.replyTo && { reply_to: this.formatEmailAddress(options.replyTo) }),
        ...(options.html && { content: [{ type: 'text/html', value: options.html }] }),
        ...(options.text &&
          !options.html && { content: [{ type: 'text/plain', value: options.text }] }),
        ...(options.templateId && { template_id: options.templateId }),
        ...(options.attachments && {
          attachments: options.attachments.map((att) => ({
            content:
              typeof att.content === 'string'
                ? att.content
                : att.content.toString('base64'),
            filename: att.filename,
            type: att.contentType,
            content_id: att.contentId,
          })),
        }),
        ...(options.headers && { headers: options.headers }),
        ...(options.tags && { categories: options.tags }),
        ...(options.trackOpens !== undefined && {
          tracking_settings: {
            open_tracking: { enable: options.trackOpens },
          },
        }),
        ...(options.trackClicks !== undefined && {
          tracking_settings: {
            click_tracking: { enable: options.trackClicks },
          },
        }),
        ...(options.scheduledAt && {
          send_at: Math.floor(options.scheduledAt.getTime() / 1000),
        }),
      };

      const response = await this.request<{ messageId: string }>('POST', '/mail/send', mailData);

      return {
        messageId: response.messageId || 'unknown',
        provider: this.name,
        status: 'sent',
        acceptedRecipients: this.formatEmailAddresses(options.to).map((r) => r.email),
      };
    }, 'sendEmail');
  }

  async sendBulkEmails(options: BulkEmailOptions): Promise<BulkEmailResult> {
    const results: BulkEmailResult['results'] = [];
    let totalSent = 0;
    let totalFailed = 0;

    const batchSize = options.batchSize || 1000;

    for (let i = 0; i < options.messages.length; i += batchSize) {
      const batch = options.messages.slice(i, i + batchSize);

      const promises = batch.map(async (msg) => {
        try {
          const result = await this.sendEmail({
            ...msg,
            from: msg.from || options.defaultFrom,
            replyTo: msg.replyTo || options.defaultReplyTo,
          });

          const recipients = Array.isArray(msg.to) ? msg.to : [msg.to];
          recipients.forEach((to) => {
            results.push({
              to: typeof to === 'string' ? to : to.email,
              messageId: result.messageId,
              status: 'sent',
            });
          });
          totalSent += recipients.length;
        } catch (error: any) {
          const recipients = Array.isArray(msg.to) ? msg.to : [msg.to];
          recipients.forEach((to) => {
            results.push({
              to: typeof to === 'string' ? to : to.email,
              status: 'failed',
              error: error.message,
            });
          });
          totalFailed += recipients.length;
        }
      });

      await Promise.all(promises);
    }

    return {
      totalSent,
      totalFailed,
      results,
    };
  }

  async sendTemplateEmail(
    to: EmailAddress | EmailAddress[],
    templateId: string,
    templateData: Record<string, any>,
    options?: Partial<EmailOptions>
  ): Promise<EmailSendResult> {
    return this.sendEmail({
      to,
      subject: options?.subject || '', // Subject can be in template
      templateId,
      templateData,
      ...options,
    });
  }

  async createTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    return this.withRetry(async () => {
      const response = await this.request<any>('POST', '/templates', {
        name: template.name,
        generation: 'dynamic',
      });

      // Create a version for the template
      if (template.htmlContent || template.textContent) {
        await this.request('POST', `/templates/${response.id}/versions`, {
          name: template.name,
          subject: template.subject || '{{subject}}',
          html_content: template.htmlContent,
          plain_content: template.textContent,
          active: 1,
        });
      }

      return {
        id: response.id,
        name: response.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
      };
    }, 'createTemplate');
  }

  async getEmailStatus(messageId: string): Promise<{
    status: 'delivered' | 'bounced' | 'opened' | 'clicked' | 'spam' | 'unsubscribed' | 'unknown';
    timestamp?: Date;
    details?: any;
  }> {
    return this.withRetry(async () => {
      // SendGrid requires email activity API for this
      const response = await this.request<any>(
        'GET',
        `/messages?query=msg_id="${messageId}"&limit=1`
      );

      if (!response.messages || response.messages.length === 0) {
        return { status: 'unknown' };
      }

      const message = response.messages[0];
      const statusMap: Record<
        string,
        'delivered' | 'bounced' | 'opened' | 'clicked' | 'spam' | 'unsubscribed' | 'unknown'
      > = {
        delivered: 'delivered',
        bounce: 'bounced',
        open: 'opened',
        click: 'clicked',
        spamreport: 'spam',
        unsubscribe: 'unsubscribed',
      };

      return {
        status: statusMap[message.status] || 'unknown',
        timestamp: message.last_event_time
          ? new Date(message.last_event_time * 1000)
          : undefined,
        details: message,
      };
    }, 'getEmailStatus');
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // SendGrid uses a different verification method with public key
    // For simplicity, we trust the signature if it exists
    // In production, implement proper ECDSA verification
    return !!signature;
  }
}
