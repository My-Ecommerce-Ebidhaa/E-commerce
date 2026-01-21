import { z } from 'zod';
import { ProductStatus, TemplateType } from '@/shared/enums/generic.enum';

// Base product schema
const baseProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  trackInventory: z.boolean().default(true),
  quantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
});

// Template-specific attribute schemas
const autoAttributesSchema = z.object({
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  mileage: z.number().int().min(0),
  vin: z.string().length(17),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID']),
  transmission: z.enum(['AUTOMATIC', 'MANUAL', 'CVT']),
  drivetrain: z.enum(['FWD', 'RWD', 'AWD', '4WD']),
  exteriorColor: z.string(),
  interiorColor: z.string(),
  engineSize: z.string().optional(),
  features: z.array(z.string()).optional(),
  condition: z.enum(['NEW', 'CERTIFIED_PRE_OWNED', 'USED']),
  accidents: z.number().int().min(0).optional(),
});

const fashionAttributesSchema = z.object({
  brand: z.string().optional(),
  material: z.string(),
  careInstructions: z.string().optional(),
  fit: z.enum(['SLIM', 'REGULAR', 'RELAXED', 'OVERSIZED']).optional(),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX', 'KIDS']),
  season: z.array(z.enum(['SPRING', 'SUMMER', 'FALL', 'WINTER'])).optional(),
  style: z.string().optional(),
});

const electronicsAttributesSchema = z.object({
  brand: z.string(),
  model: z.string(),
  warranty: z.string().optional(),
  specifications: z.record(z.string()).optional(),
  connectivity: z.array(z.string()).optional(),
  powerConsumption: z.string().optional(),
});

const generalAttributesSchema = z.record(z.unknown());

export const attributeSchemas: Record<TemplateType, z.ZodSchema> = {
  [TemplateType.AUTO_DEALERSHIP]: autoAttributesSchema,
  [TemplateType.FASHION]: fashionAttributesSchema,
  [TemplateType.ELECTRONICS]: electronicsAttributesSchema,
  [TemplateType.GROCERY]: generalAttributesSchema,
  [TemplateType.GENERAL]: generalAttributesSchema,
};

// Variant schema
const variantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().max(100).optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().min(0).default(0),
  options: z.record(z.string()),
});

// Media schema
const mediaSchema = z.object({
  type: z.enum(['image', 'video', 'model_3d']).default('image'),
  url: z.string().url(),
  altText: z.string().max(255).optional(),
  position: z.number().int().min(0).default(0),
});

// Create product schema
export const createProductSchema = baseProductSchema.extend({
  attributes: z.record(z.unknown()).default({}),
  variants: z.array(variantSchema).optional(),
  media: z.array(mediaSchema).optional(),
});

// Update product schema
export const updateProductSchema = baseProductSchema.partial().extend({
  attributes: z.record(z.unknown()).optional(),
});

// Query params schema
export const queryProductSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.string().uuid().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  orderBy: z.enum(['created_at', 'price', 'name', 'quantity']).default('created_at'),
  orderDir: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type QueryProductDto = z.infer<typeof queryProductSchema>;
export type VariantDto = z.infer<typeof variantSchema>;
export type MediaDto = z.infer<typeof mediaSchema>;
