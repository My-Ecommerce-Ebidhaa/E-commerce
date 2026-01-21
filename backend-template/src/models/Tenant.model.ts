import { BaseModel } from './Base.model';
import { Model, RelationMappings } from 'objection';
import { TemplateType, TenantStatus } from '@/shared/enums/generic.enum';

export interface TenantSettings {
  // Branding
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  gradientColors?: {
    start?: string;
    end?: string;
    direction?: 'to-right' | 'to-bottom' | 'to-bottom-right';
  };

  // Contact info
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  supportEmail?: string;
  address?: string;

  // Social links
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };

  // Regional
  currency?: string;
  timezone?: string;

  // KYC/Business information
  kyc?: {
    businessRegistrationNumber?: string;
    taxId?: string;
    businessType?: 'sole_proprietorship' | 'partnership' | 'corporation' | 'llc';
    registeredAddress?: string;
    registeredCountry?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    verifiedAt?: string;
  };

  // About/Description
  about?: {
    shortDescription?: string;
    longDescription?: string;
    mission?: string;
    vision?: string;
  };

  // Store policies
  policies?: {
    returnPolicy?: string;
    shippingPolicy?: string;
    privacyPolicy?: string;
    termsOfService?: string;
  };
}

export class Tenant extends BaseModel {
  static tableName = 'tenants';

  name!: string;
  slug!: string;
  custom_domain?: string;
  template_type!: TemplateType;
  settings!: TenantSettings;
  status!: TenantStatus;

  // Provider default flags
  use_default_payment_provider!: boolean;
  use_default_email_provider!: boolean;
  use_default_sms_provider!: boolean;

  // Relations
  users?: Model[];
  products?: Model[];
  categories?: Model[];
  orders?: Model[];

  static get relationMappings(): RelationMappings {
    const { User } = require('./User.model');
    const { Product } = require('./Product.model');
    const { Category } = require('./Category.model');
    const { Order } = require('./Order.model');

    return {
      users: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'tenants.id',
          to: 'users.tenant_id',
        },
      },
      products: {
        relation: Model.HasManyRelation,
        modelClass: Product,
        join: {
          from: 'tenants.id',
          to: 'products.tenant_id',
        },
      },
      categories: {
        relation: Model.HasManyRelation,
        modelClass: Category,
        join: {
          from: 'tenants.id',
          to: 'categories.tenant_id',
        },
      },
      orders: {
        relation: Model.HasManyRelation,
        modelClass: Order,
        join: {
          from: 'tenants.id',
          to: 'orders.tenant_id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        slug: { type: 'string', minLength: 1, maxLength: 100 },
        custom_domain: { type: ['string', 'null'], maxLength: 255 },
        template_type: { type: 'string', enum: Object.values(TemplateType) },
        settings: { type: 'object' },
        status: { type: 'string', enum: Object.values(TenantStatus) },
        use_default_payment_provider: { type: 'boolean' },
        use_default_email_provider: { type: 'boolean' },
        use_default_sms_provider: { type: 'boolean' },
      },
    };
  }
}
