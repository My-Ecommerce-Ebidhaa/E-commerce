import { z } from 'zod';

const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2),
  phone: z.string().optional(),
});

export const initiateCheckoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
  shippingMethod: z.enum(['standard', 'express', 'overnight']).default('standard'),
  discountCode: z.string().optional(),
});

export const confirmCheckoutSchema = z.object({
  paymentIntentId: z.string(),
});

export const calculateShippingSchema = z.object({
  postalCode: z.string().min(1),
  country: z.string().length(2),
});

export type InitiateCheckoutDto = z.infer<typeof initiateCheckoutSchema>;
export type ConfirmCheckoutDto = z.infer<typeof confirmCheckoutSchema>;
export type CalculateShippingDto = z.infer<typeof calculateShippingSchema>;
export type AddressDto = z.infer<typeof addressSchema>;
