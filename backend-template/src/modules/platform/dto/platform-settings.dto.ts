import { z } from 'zod';

// Configure default provider (used for payment, email, and sms)
export const configureDefaultProviderSchema = z.object({
  provider: z.string().min(1),
  credentials: z.record(z.string(), z.any()),
  settings: z.record(z.string(), z.any()).optional(),
});

// Update platform general settings
export const updatePlatformSettingsSchema = z.object({
  defaultBranding: z
    .object({
      defaultPrimaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      defaultSecondaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      defaultAccentColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      defaultGradientStart: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      defaultGradientEnd: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
    })
    .optional(),
  supportEmail: z.string().email().optional(),
  supportPhone: z.string().max(50).optional(),
});

// Provider type enum
export const providerTypeSchema = z.enum(['payment', 'email', 'sms']);

// Types
export type ConfigureDefaultProviderDto = z.infer<typeof configureDefaultProviderSchema>;
export type UpdatePlatformSettingsDto = z.infer<typeof updatePlatformSettingsSchema>;
export type ProviderType = z.infer<typeof providerTypeSchema>;
