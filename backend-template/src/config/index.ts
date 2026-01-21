import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().default('4000'),
  APP_NAME: z.string().default('ecommerce-api'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string(),
  DATABASE_POOL_MIN: z.string().default('2'),
  DATABASE_POOL_MAX: z.string().default('20'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // S3
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),

  // Meilisearch
  MEILISEARCH_HOST: z.string().default('http://localhost:7700'),
  MEILISEARCH_API_KEY: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@example.com'),

  // Idempotency
  IDEMPOTENCY_EXPIRY_MINUTES: z.string().default('30'),
});

const env = envSchema.parse(process.env);

export const config = {
  app: {
    name: env.APP_NAME,
    env: env.NODE_ENV,
    port: parseInt(env.PORT, 10),
    apiVersion: env.API_VERSION,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
  },

  database: {
    url: env.DATABASE_URL,
    pool: {
      min: parseInt(env.DATABASE_POOL_MIN, 10),
      max: parseInt(env.DATABASE_POOL_MAX, 10),
    },
  },

  redis: {
    url: env.REDIS_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },

  s3: {
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    endpoint: env.S3_ENDPOINT,
  },

  meilisearch: {
    host: env.MEILISEARCH_HOST,
    apiKey: env.MEILISEARCH_API_KEY,
  },

  email: {
    apiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM,
  },

  idempotency: {
    expiryMinutes: parseInt(env.IDEMPOTENCY_EXPIRY_MINUTES, 10),
  },
} as const;

export type Config = typeof config;
