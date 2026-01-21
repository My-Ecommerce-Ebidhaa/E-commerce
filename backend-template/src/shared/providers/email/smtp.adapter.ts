/**
 * SMTP Email Provider Adapter
 * Implements IEmailProvider interface for generic SMTP servers
 */

import * as nodemailer from 'nodemailer';
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
} from './email.interface';

interface SmtpConfig extends EmailProviderConfig {
  host: string;
  port: number;
  secure?: boolean;
  username?: string;
  password?: string;
  from?: EmailAddress;
}

export class SmtpAdapter extends BaseProvider implements IEmailProvider {
  protected providerName = 'SMTP';

  readonly name = 'smtp';
  readonly supportedFeatures = [
    EmailFeature.ATTACHMENTS,
  ];

  private transporter: nodemailer.Transporter;
  private readonly defaultFrom?: EmailAddress;

  constructor(config: SmtpConfig) {
    super();
    this.defaultFrom = config.from;

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      auth: config.username
        ? {
            user: config.username,
            pass: config.password,
          }
        : undefined,
    });
  }

  private formatEmailAddress(address: EmailAddress): string {
    if (address.name) {
      return `"${address.name}" <${address.email}>`;
    }
    return address.email;
  }

  private formatEmailAddresses(
    addresses: EmailAddress | EmailAddress[]
  ): string {
    const addressList = Array.isArray(addresses) ? addresses : [addresses];
    return addressList.map((addr) => this.formatEmailAddress(addr)).join(', ');
  }

  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    return this.withRetry(async () => {
      const from = options.from || this.defaultFrom;
      if (!from) {
        throw new Error('From address is required');
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: this.formatEmailAddress(from),
        to: this.formatEmailAddresses(options.to),
        subject: options.subject,
        text: options.text,
        html: options.html,
        ...(options.replyTo && { replyTo: this.formatEmailAddress(options.replyTo) }),
        ...(options.cc && { cc: this.formatEmailAddresses(options.cc) }),
        ...(options.bcc && { bcc: this.formatEmailAddresses(options.bcc) }),
        ...(options.headers && { headers: options.headers }),
        ...(options.attachments && {
          attachments: options.attachments.map((att) => ({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType,
            encoding: att.encoding,
            cid: att.contentId,
          })),
        }),
      };

      const info = await this.transporter.sendMail(mailOptions);

      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      return {
        messageId: info.messageId,
        provider: this.name,
        status: 'sent',
        acceptedRecipients: info.accepted as string[],
        rejectedRecipients: info.rejected as string[],
        rawResponse: info,
      };
    }, 'sendEmail');
  }

  async sendBulkEmails(options: BulkEmailOptions): Promise<BulkEmailResult> {
    const results: BulkEmailResult['results'] = [];
    let totalSent = 0;
    let totalFailed = 0;

    const batchSize = options.batchSize || 50;

    for (let i = 0; i < options.messages.length; i += batchSize) {
      const batch = options.messages.slice(i, i + batchSize);

      for (const msg of batch) {
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

        // Small delay between sends to avoid rate limiting
        await this.sleep(100);
      }
    }

    return {
      totalSent,
      totalFailed,
      results,
    };
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
