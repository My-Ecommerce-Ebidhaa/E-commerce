import { z } from 'zod';

export const configurePaymentProviderSchema = z.object({
  provider: z.string().min(1),
  credentials: z.record(z.string(), z.any()),
  settings: z.record(z.string(), z.any()).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updatePaymentProviderSchema = z.object({
  credentials: z.record(z.string(), z.any()).optional(),
  settings: z.record(z.string(), z.any()).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const configureEmailProviderSchema = z.object({
  provider: z.string().min(1),
  credentials: z.record(z.string(), z.any()),
  settings: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateEmailProviderSchema = z.object({
  credentials: z.record(z.string(), z.any()).optional(),
  settings: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
});

export const configureSmsProviderSchema = z.object({
  provider: z.string().min(1),
  credentials: z.record(z.string(), z.any()),
  settings: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateSmsProviderSchema = z.object({
  credentials: z.record(z.string(), z.any()).optional(),
  settings: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
});

export type ConfigurePaymentProviderDto = z.infer<typeof configurePaymentProviderSchema>;
export type UpdatePaymentProviderDto = z.infer<typeof updatePaymentProviderSchema>;
export type ConfigureEmailProviderDto = z.infer<typeof configureEmailProviderSchema>;
export type UpdateEmailProviderDto = z.infer<typeof updateEmailProviderSchema>;
export type ConfigureSmsProviderDto = z.infer<typeof configureSmsProviderSchema>;
export type UpdateSmsProviderDto = z.infer<typeof updateSmsProviderSchema>;
