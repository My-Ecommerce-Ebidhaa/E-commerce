/**
 * Base provider with retry logic and exponential backoff
 * Pattern inspired by production implementations
 */

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'NETWORK_ERROR',
    'RATE_LIMIT',
    '429',
    '502',
    '503',
    '504',
  ],
};

export abstract class BaseProvider {
  protected abstract providerName: string;
  protected retryConfig: RetryConfig;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Execute an operation with retry and exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.retryConfig.initialDelayMs;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        const isRetryable = this.isRetryableError(error);
        const hasMoreAttempts = attempt < this.retryConfig.maxAttempts;

        if (!isRetryable || !hasMoreAttempts) {
          console.error(
            `[${this.providerName}] ${operationName} failed after ${attempt} attempt(s):`,
            error.message
          );
          throw error;
        }

        console.warn(
          `[${this.providerName}] ${operationName} attempt ${attempt} failed, retrying in ${delay}ms:`,
          error.message
        );

        await this.sleep(delay);

        // Exponential backoff with jitter
        delay = Math.min(
          delay * this.retryConfig.backoffMultiplier + Math.random() * 100,
          this.retryConfig.maxDelayMs
        );
      }
    }

    throw lastError;
  }

  /**
   * Check if an error is retryable
   */
  protected isRetryableError(error: any): boolean {
    const errorCode = error.code || error.statusCode || error.status;
    const errorMessage = error.message || '';

    return (
      this.retryConfig.retryableErrors?.some(
        (code) =>
          errorCode?.toString() === code ||
          errorMessage.includes(code)
      ) ?? false
    );
  }

  /**
   * Sleep for a specified duration
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log provider activity
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.providerName}] ${message}`;

    if (level === 'error') {
      console.error(logMessage, data || '');
    } else if (level === 'warn') {
      console.warn(logMessage, data || '');
    } else {
      console.log(logMessage, data || '');
    }
  }
}

/**
 * Encryption service for storing provider credentials
 */
import * as crypto from 'crypto';

export class CredentialsEncryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly key: Buffer;

  constructor(encryptionKey: string) {
    // Derive a proper key from the provided string
    this.key = crypto.scryptSync(encryptionKey, 'salt', this.keyLength);
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Combine IV + Tag + Encrypted data
    return iv.toString('hex') + tag.toString('hex') + encrypted;
  }

  decrypt(ciphertext: string): string {
    const iv = Buffer.from(ciphertext.substring(0, this.ivLength * 2), 'hex');
    const tag = Buffer.from(
      ciphertext.substring(this.ivLength * 2, this.ivLength * 2 + this.tagLength * 2),
      'hex'
    );
    const encrypted = ciphertext.substring(this.ivLength * 2 + this.tagLength * 2);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
