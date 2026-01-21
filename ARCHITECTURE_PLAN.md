# E-commerce Templating Engine - Architecture Plan

## Overview

A multi-tenant e-commerce platform that supports different business types (auto dealerships, fashion stores, electronics, etc.) through a flexible templating system. Each tenant gets a customized storefront while sharing the core e-commerce infrastructure.

---

## Project Structure

```
E-commerce/
├── backend-template/          # Node.js REST API Server
├── frontend-template/         # Next.js Application
└── ARCHITECTURE_PLAN.md       # This file
```

---

## Part 1: Backend API Server

**Location:** `/Users/adio/Documents/workspace/ebidhaa/E-commerce/backend-template`

### Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + TypeScript | Runtime & Language |
| Restana / Express | HTTP Framework |
| Knex.js | Query Builder & Migrations |
| Objection.js | ORM (on top of Knex) |
| PostgreSQL | Primary Database |
| Redis | Caching, Sessions, Queue |
| Zod | Request Validation |
| tsyringe | Dependency Injection |
| Pino | Logging |
| BullMQ | Background Jobs |
| Meilisearch | Full-text Search |

### Directory Structure

```
backend-template/
├── src/
│   ├── app.ts                              # Express/Restana app setup
│   ├── server.ts                           # Server entry point
│   ├── bootstrap.ts                        # App bootstrapping, DI container setup
│   │
│   ├── config/
│   │   ├── index.ts                        # Config barrel export
│   │   ├── env.config.ts                   # Environment variables (validated)
│   │   ├── database.config.ts              # DB connection config
│   │   └── services.config.ts              # External services config
│   │
│   ├── database/
│   │   ├── index.ts                        # Database initialization
│   │   ├── knex.ts                         # Knex instance
│   │   ├── migrations/                     # Knex migrations
│   │   │   ├── 20240101000000_create_tenants.ts
│   │   │   ├── 20240101000001_create_users.ts
│   │   │   ├── 20240101000002_create_products.ts
│   │   │   ├── 20240101000003_create_categories.ts
│   │   │   ├── 20240101000004_create_carts.ts
│   │   │   ├── 20240101000005_create_orders.ts
│   │   │   ├── 20240101000006_create_discounts.ts
│   │   │   └── ...
│   │   └── seeds/                          # Seed data
│   │       ├── 01_tenants.ts
│   │       ├── 02_categories.ts
│   │       └── 03_sample_products.ts
│   │
│   ├── models/                             # Objection.js Models
│   │   ├── Base.model.ts                   # Base model with common methods
│   │   ├── Tenant.model.ts
│   │   ├── User.model.ts
│   │   ├── Product.model.ts
│   │   ├── ProductVariant.model.ts
│   │   ├── ProductMedia.model.ts
│   │   ├── Category.model.ts
│   │   ├── Cart.model.ts
│   │   ├── CartItem.model.ts
│   │   ├── Order.model.ts
│   │   ├── OrderItem.model.ts
│   │   ├── Address.model.ts
│   │   ├── Discount.model.ts
│   │   ├── Review.model.ts
│   │   └── WishlistItem.model.ts
│   │
│   ├── repositories/                       # Data Access Layer
│   │   ├── base.repo.ts                    # Abstract base repository
│   │   ├── tenant.repo.ts
│   │   ├── user.repo.ts
│   │   ├── product.repo.ts
│   │   ├── category.repo.ts
│   │   ├── cart.repo.ts
│   │   ├── order.repo.ts
│   │   ├── discount.repo.ts
│   │   ├── review.repo.ts
│   │   └── wishlist.repo.ts
│   │
│   ├── modules/                            # Feature Modules
│   │   ├── health/
│   │   │   ├── health.controller.ts
│   │   │   └── health.route.ts
│   │   │
│   │   ├── tenant/
│   │   │   ├── tenant.controller.ts
│   │   │   ├── tenant.service.ts
│   │   │   ├── tenant.route.ts
│   │   │   └── dto/
│   │   │       ├── create-tenant.dto.ts
│   │   │       └── update-tenant.dto.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── local.strategy.ts
│   │   │   │   └── google.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── register.dto.ts
│   │   │       └── reset-password.dto.ts
│   │   │
│   │   ├── product/
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.route.ts
│   │   │   ├── product-attribute.schema.ts  # Zod schemas per template type
│   │   │   └── dto/
│   │   │       ├── create-product.dto.ts
│   │   │       ├── update-product.dto.ts
│   │   │       └── query-product.dto.ts
│   │   │
│   │   ├── category/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   ├── category.route.ts
│   │   │   └── dto/
│   │   │
│   │   ├── cart/
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── cart.route.ts
│   │   │   ├── pricing.service.ts          # Price calculations, discounts
│   │   │   └── dto/
│   │   │       ├── add-item.dto.ts
│   │   │       └── update-item.dto.ts
│   │   │
│   │   ├── checkout/
│   │   │   ├── checkout.controller.ts
│   │   │   ├── checkout.service.ts
│   │   │   ├── checkout.route.ts
│   │   │   ├── shipping.service.ts         # Shipping rate calculation
│   │   │   ├── tax.service.ts              # Tax calculation
│   │   │   └── dto/
│   │   │       └── create-checkout.dto.ts
│   │   │
│   │   ├── order/
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.route.ts
│   │   │   ├── order-number.service.ts     # Generate ORD-2024-00001
│   │   │   └── dto/
│   │   │
│   │   ├── payment/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.route.ts
│   │   │   ├── gateways/
│   │   │   │   ├── gateway.interface.ts
│   │   │   │   ├── stripe.gateway.ts
│   │   │   │   └── paypal.gateway.ts
│   │   │   └── webhooks/
│   │   │       ├── stripe.webhook.ts
│   │   │       └── paypal.webhook.ts
│   │   │
│   │   ├── inventory/
│   │   │   ├── inventory.controller.ts
│   │   │   ├── inventory.service.ts
│   │   │   └── inventory.route.ts
│   │   │
│   │   ├── search/
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   ├── search.route.ts
│   │   │   └── indexer.service.ts          # Sync products to Meilisearch
│   │   │
│   │   ├── media/
│   │   │   ├── media.controller.ts
│   │   │   ├── media.service.ts
│   │   │   ├── media.route.ts
│   │   │   ├── upload.service.ts           # S3/Cloudflare R2 upload
│   │   │   └── image-processor.service.ts  # Sharp for resizing
│   │   │
│   │   ├── review/
│   │   │   ├── review.controller.ts
│   │   │   ├── review.service.ts
│   │   │   └── review.route.ts
│   │   │
│   │   ├── wishlist/
│   │   │   ├── wishlist.controller.ts
│   │   │   ├── wishlist.service.ts
│   │   │   └── wishlist.route.ts
│   │   │
│   │   └── notification/
│   │       ├── notification.service.ts
│   │       ├── email/
│   │       │   ├── email.service.ts
│   │       │   └── templates/
│   │       │       ├── order-confirmation.hbs
│   │       │       ├── shipping-update.hbs
│   │       │       ├── password-reset.hbs
│   │       │       └── welcome.hbs
│   │       └── sms/
│   │           └── sms.service.ts
│   │
│   ├── shared/
│   │   ├── enums/
│   │   │   ├── generic.enum.ts             # App-level enums
│   │   │   ├── template-type.enum.ts       # AUTO, FASHION, ELECTRONICS, etc.
│   │   │   ├── order-status.enum.ts
│   │   │   ├── payment-status.enum.ts
│   │   │   └── user-role.enum.ts
│   │   │
│   │   ├── errors/
│   │   │   ├── app.error.ts                # Base AppError class
│   │   │   ├── not-found.error.ts
│   │   │   ├── validation.error.ts
│   │   │   ├── unauthorized.error.ts
│   │   │   ├── forbidden.error.ts
│   │   │   └── payment.error.ts
│   │   │
│   │   ├── interfaces/
│   │   │   ├── repository.interface.ts     # IRepository<T>
│   │   │   ├── service.interface.ts
│   │   │   ├── pagination.interface.ts
│   │   │   ├── query-params.interface.ts
│   │   │   └── tenant-context.interface.ts
│   │   │
│   │   ├── middlewares/
│   │   │   ├── index.ts                    # Middleware initializer
│   │   │   ├── error-handler.middleware.ts
│   │   │   ├── tenant.middleware.ts        # Extract tenant from request
│   │   │   ├── auth.middleware.ts          # JWT validation
│   │   │   ├── validate.middleware.ts      # Zod validation
│   │   │   ├── rate-limit.middleware.ts
│   │   │   └── logging.middleware.ts
│   │   │
│   │   ├── services/
│   │   │   ├── redis.service.ts            # Redis client wrapper
│   │   │   ├── cache.service.ts            # Caching abstraction
│   │   │   └── queue.service.ts            # BullMQ wrapper
│   │   │
│   │   ├── types/
│   │   │   ├── express.d.ts                # Express type extensions
│   │   │   ├── request.types.ts
│   │   │   └── response.types.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── response.util.ts            # SuccessResponse, ErrorResponse
│   │   │   ├── pagination.util.ts
│   │   │   ├── slug.util.ts
│   │   │   ├── date-time.util.ts
│   │   │   ├── encrypt.util.ts
│   │   │   ├── random.util.ts
│   │   │   └── currency.util.ts
│   │   │
│   │   ├── validations/
│   │   │   └── zod/
│   │   │       ├── common.schema.ts        # Reusable schemas (email, uuid, etc.)
│   │   │       ├── pagination.schema.ts
│   │   │       └── address.schema.ts
│   │   │
│   │   └── logger/
│   │       └── index.ts                    # Pino logger setup
│   │
│   └── jobs/                               # Background Jobs (BullMQ)
│       ├── queue.ts                        # Queue definitions
│       ├── workers/
│       │   ├── email.worker.ts
│       │   ├── search-index.worker.ts
│       │   ├── inventory-alert.worker.ts
│       │   └── order-status.worker.ts
│       └── processors/
│           ├── email.processor.ts
│           └── search-index.processor.ts
│
├── knexfile.ts                             # Knex configuration
├── tsconfig.json
├── package.json
├── Dockerfile
├── docker-compose.yml                      # Local dev (Postgres, Redis, Meilisearch)
├── .env.example
└── README.md
```

### Database Schema

#### Core Tables

```sql
-- Tenants (Stores)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    template_type VARCHAR(50) NOT NULL, -- AUTO_DEALERSHIP, FASHION, ELECTRONICS, GENERAL
    settings JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, trial
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer', -- customer, admin, super_admin
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    parent_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    category_id UUID REFERENCES categories(id),

    -- Core fields
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, archived

    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),

    -- Inventory
    sku VARCHAR(100),
    barcode VARCHAR(100),
    track_inventory BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,

    -- Flexible attributes (template-specific)
    attributes JSONB DEFAULT '{}',

    -- SEO
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

-- Product Variants
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10,2),
    quantity INT DEFAULT 0,
    options JSONB NOT NULL, -- { "color": "Red", "size": "Large" }
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Media
CREATE TABLE product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- image, video, model_3d
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Addresses
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(255),
    address_1 VARCHAR(255) NOT NULL,
    address_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Carts
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) UNIQUE,
    discount_code VARCHAR(50),
    discount_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(cart_id, product_id, variant_id)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    order_number VARCHAR(50) NOT NULL,

    -- Contact
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    -- Addresses (snapshot)
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,

    -- Totals
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, partially_refunded, refunded, failed
    fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled', -- unfulfilled, partially_fulfilled, fulfilled

    -- Payment
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255),

    -- Shipping
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url VARCHAR(500),

    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, order_number)
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),

    -- Snapshot at time of order
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Discounts
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    code VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL, -- percentage, fixed_amount, free_shipping
    value DECIMAL(10,2) NOT NULL,
    min_purchase DECIMAL(10,2),
    max_uses INT,
    used_count INT DEFAULT 0,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Wishlist Items
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Indexes
CREATE INDEX idx_products_tenant_status ON products(tenant_id, status);
CREATE INDEX idx_products_tenant_category ON products(tenant_id, category_id);
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_tenant_user ON orders(tenant_id, user_id);
CREATE INDEX idx_carts_tenant_session ON carts(tenant_id, session_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_categories_tenant_parent ON categories(tenant_id, parent_id);
```

### Template-Specific Product Attributes

```typescript
// AUTO_DEALERSHIP attributes
{
  year: number,
  make: string,
  model: string,
  trim: string,
  mileage: number,
  vin: string,
  fuel_type: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'PLUGIN_HYBRID',
  transmission: 'AUTOMATIC' | 'MANUAL' | 'CVT',
  drivetrain: 'FWD' | 'RWD' | 'AWD' | '4WD',
  exterior_color: string,
  interior_color: string,
  engine_size: string,
  features: string[],
  condition: 'NEW' | 'CERTIFIED_PRE_OWNED' | 'USED',
  accidents: number
}

// FASHION attributes
{
  brand: string,
  material: string,
  care_instructions: string,
  fit: 'SLIM' | 'REGULAR' | 'RELAXED' | 'OVERSIZED',
  gender: 'MEN' | 'WOMEN' | 'UNISEX' | 'KIDS',
  season: string[],
  style: string
}

// ELECTRONICS attributes
{
  brand: string,
  model: string,
  warranty: string,
  specifications: Record<string, string>,
  connectivity: string[],
  power_consumption: string
}
```

### API Endpoints

```
# Health
GET     /health

# Auth
POST    /v1/auth/register
POST    /v1/auth/login
POST    /v1/auth/logout
POST    /v1/auth/refresh
POST    /v1/auth/forgot-password
POST    /v1/auth/reset-password
GET     /v1/auth/me

# Tenants (Admin)
GET     /v1/tenants
POST    /v1/tenants
GET     /v1/tenants/:id
PATCH   /v1/tenants/:id
DELETE  /v1/tenants/:id
GET     /v1/tenants/by-domain/:domain
GET     /v1/tenants/by-slug/:slug

# Products
GET     /v1/products                    # List with filters, pagination
POST    /v1/products                    # Create (admin)
GET     /v1/products/:slug              # Get by slug
GET     /v1/products/id/:id             # Get by ID
PATCH   /v1/products/:id                # Update (admin)
DELETE  /v1/products/:id                # Delete (admin)
POST    /v1/products/:id/variants       # Add variant
PATCH   /v1/products/:id/variants/:vid  # Update variant
DELETE  /v1/products/:id/variants/:vid  # Delete variant

# Categories
GET     /v1/categories
POST    /v1/categories
GET     /v1/categories/:slug
PATCH   /v1/categories/:id
DELETE  /v1/categories/:id
GET     /v1/categories/:id/products

# Cart
GET     /v1/cart
POST    /v1/cart/items
PATCH   /v1/cart/items/:id
DELETE  /v1/cart/items/:id
DELETE  /v1/cart                        # Clear cart
POST    /v1/cart/discount               # Apply discount code

# Checkout
POST    /v1/checkout                    # Create checkout session
POST    /v1/checkout/shipping-rates     # Get shipping rates
POST    /v1/checkout/tax                # Calculate tax

# Orders
GET     /v1/orders                      # List user orders
GET     /v1/orders/:id
POST    /v1/orders/:id/cancel
GET     /v1/admin/orders                # Admin: all orders
PATCH   /v1/admin/orders/:id            # Admin: update status

# Payments
POST    /v1/payments/intent             # Create payment intent
POST    /v1/payments/confirm            # Confirm payment
POST    /v1/webhooks/stripe             # Stripe webhook
POST    /v1/webhooks/paypal             # PayPal webhook

# Search
GET     /v1/search                      # Full-text search
GET     /v1/search/suggestions          # Autocomplete

# Reviews
GET     /v1/products/:id/reviews
POST    /v1/products/:id/reviews
PATCH   /v1/reviews/:id
DELETE  /v1/reviews/:id

# Wishlist
GET     /v1/wishlist
POST    /v1/wishlist
DELETE  /v1/wishlist/:productId

# Media
POST    /v1/media/upload
DELETE  /v1/media/:id

# User Account
GET     /v1/account
PATCH   /v1/account
GET     /v1/account/addresses
POST    /v1/account/addresses
PATCH   /v1/account/addresses/:id
DELETE  /v1/account/addresses/:id
```

### Key Backend Patterns

#### 1. Dependency Injection (tsyringe)

```typescript
// src/modules/product/product.service.ts
import { injectable, inject } from 'tsyringe';

@injectable()
export class ProductService {
  constructor(
    @inject('ProductRepository') private productRepo: ProductRepository,
    @inject('SearchService') private searchService: SearchService,
    @inject('CacheService') private cacheService: CacheService,
  ) {}

  async findAll(tenantId: string, params: QueryProductDto) {
    const cacheKey = `products:${tenantId}:${JSON.stringify(params)}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await this.productRepo.findByTenant(tenantId, params);
    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }
}
```

#### 2. Base Repository Pattern

```typescript
// src/repositories/base.repo.ts
import { Model, QueryBuilder } from 'objection';

export abstract class BaseRepository<T extends Model> {
  constructor(protected model: typeof Model) {}

  async findById(id: string): Promise<T | undefined> {
    return this.model.query().findById(id) as Promise<T | undefined>;
  }

  async findOne(conditions: Partial<T>): Promise<T | undefined> {
    return this.model.query().findOne(conditions) as Promise<T | undefined>;
  }

  async findAll(conditions?: Partial<T>): Promise<T[]> {
    const query = this.model.query();
    if (conditions) query.where(conditions);
    return query as unknown as Promise<T[]>;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.query().insert(data).returning('*') as Promise<T>;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.query().patchAndFetchById(id, data) as Promise<T>;
  }

  async delete(id: string): Promise<number> {
    return this.model.query().deleteById(id);
  }

  async paginate(params: PaginationParams): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    const [data, countResult] = await Promise.all([
      this.model.query().offset(offset).limit(limit),
      this.model.query().count('* as count').first(),
    ]);

    const total = Number(countResult?.count || 0);

    return {
      data: data as T[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

#### 3. Tenant Middleware

```typescript
// src/shared/middlewares/tenant.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { TenantRepository } from '@/repositories/tenant.repo';
import { NotFoundError } from '@/shared/errors/not-found.error';

export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    const tenantDomain = req.headers['x-tenant-domain'] as string;

    if (!tenantSlug && !tenantDomain) {
      throw new NotFoundError('Tenant not specified');
    }

    const tenantRepo = container.resolve(TenantRepository);

    const tenant = tenantSlug
      ? await tenantRepo.findBySlug(tenantSlug)
      : await tenantRepo.findByDomain(tenantDomain);

    if (!tenant || tenant.status !== 'active') {
      throw new NotFoundError('Tenant not found or inactive');
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
}
```

#### 4. Response Utilities

```typescript
// src/shared/utils/response.util.ts
export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errorCode?: string;
}

export function SuccessResponse<T>(
  message: string,
  data?: T,
  meta?: PaginationMeta
): ApiResponse<T> {
  return {
    status: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };
}

export function ErrorResponse(
  message: string,
  errorCode?: string
): ApiResponse {
  return {
    status: false,
    message,
    ...(errorCode && { errorCode }),
  };
}
```

---

## Part 2: Frontend (Next.js)

**Location:** `/Users/adio/Documents/workspace/ebidhaa/E-commerce/frontend-template`

### Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14+ | React Framework (App Router) |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Zustand | Client State Management |
| React Query | Server State / Data Fetching |
| NextAuth.js | Authentication |
| Zod | Client-side Validation |
| React Hook Form | Form Management |

### Directory Structure

```
frontend-template/
├── src/
│   ├── app/
│   │   ├── (storefront)/                   # Customer-facing routes
│   │   │   ├── layout.tsx                  # Storefront layout
│   │   │   ├── page.tsx                    # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                # Product listing (SSR)
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx            # Product detail (SSR)
│   │   │   ├── categories/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx            # Category page
│   │   │   ├── cart/
│   │   │   │   └── page.tsx                # Cart page
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx                # Checkout
│   │   │   │   ├── success/page.tsx
│   │   │   │   └── cancel/page.tsx
│   │   │   ├── account/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx                # Dashboard
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── addresses/page.tsx
│   │   │   │   └── wishlist/page.tsx
│   │   │   ├── search/page.tsx
│   │   │   └── auth/
│   │   │       ├── login/page.tsx
│   │   │       ├── register/page.tsx
│   │   │       └── forgot-password/page.tsx
│   │   │
│   │   ├── admin/                          # Admin panel
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── categories/
│   │   │   ├── discounts/
│   │   │   └── settings/
│   │   │
│   │   ├── api/                            # API Routes (BFF)
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── cart/
│   │   │   │   ├── route.ts
│   │   │   │   └── [itemId]/route.ts
│   │   │   ├── checkout/
│   │   │   │   ├── route.ts
│   │   │   │   └── shipping/route.ts
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/route.ts
│   │   │   └── revalidate/route.ts
│   │   │
│   │   ├── layout.tsx                      # Root layout
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                             # Base UI (shadcn/ui style)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── shared/                         # Shared components
│   │   │   ├── header/
│   │   │   │   ├── header.tsx
│   │   │   │   ├── nav-menu.tsx
│   │   │   │   ├── cart-icon.tsx
│   │   │   │   ├── user-menu.tsx
│   │   │   │   └── search-bar.tsx
│   │   │   ├── footer/
│   │   │   │   └── footer.tsx
│   │   │   ├── product/
│   │   │   │   ├── product-card.tsx
│   │   │   │   ├── product-grid.tsx
│   │   │   │   ├── product-gallery.tsx
│   │   │   │   ├── product-info.tsx
│   │   │   │   ├── add-to-cart-button.tsx
│   │   │   │   ├── quantity-selector.tsx
│   │   │   │   └── variant-selector.tsx
│   │   │   ├── cart/
│   │   │   │   ├── cart-drawer.tsx
│   │   │   │   ├── cart-item.tsx
│   │   │   │   └── cart-summary.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── checkout-form.tsx
│   │   │   │   ├── address-form.tsx
│   │   │   │   ├── shipping-options.tsx
│   │   │   │   ├── payment-form.tsx
│   │   │   │   └── order-summary.tsx
│   │   │   ├── filters/
│   │   │   │   ├── filter-sidebar.tsx
│   │   │   │   ├── price-range-filter.tsx
│   │   │   │   ├── category-filter.tsx
│   │   │   │   └── active-filters.tsx
│   │   │   ├── search/
│   │   │   │   ├── search-modal.tsx
│   │   │   │   └── search-results.tsx
│   │   │   ├── pagination/
│   │   │   │   └── pagination.tsx
│   │   │   └── empty-states/
│   │   │       ├── empty-cart.tsx
│   │   │       └── no-results.tsx
│   │   │
│   │   ├── templates/                      # Template-specific components
│   │   │   ├── auto/
│   │   │   │   ├── vehicle-card.tsx
│   │   │   │   ├── vehicle-specs.tsx
│   │   │   │   ├── vehicle-gallery.tsx
│   │   │   │   ├── financing-calculator.tsx
│   │   │   │   ├── trade-in-form.tsx
│   │   │   │   ├── test-drive-booking.tsx
│   │   │   │   ├── vehicle-comparison.tsx
│   │   │   │   └── filters/
│   │   │   │       ├── make-model-filter.tsx
│   │   │   │       ├── year-filter.tsx
│   │   │   │       ├── mileage-filter.tsx
│   │   │   │       └── fuel-type-filter.tsx
│   │   │   │
│   │   │   ├── fashion/
│   │   │   │   ├── fashion-card.tsx
│   │   │   │   ├── size-selector.tsx
│   │   │   │   ├── color-swatch.tsx
│   │   │   │   ├── size-guide-modal.tsx
│   │   │   │   └── filters/
│   │   │   │       ├── size-filter.tsx
│   │   │   │       ├── color-filter.tsx
│   │   │   │       └── brand-filter.tsx
│   │   │   │
│   │   │   ├── electronics/
│   │   │   │   ├── specs-table.tsx
│   │   │   │   └── filters/
│   │   │   │       └── specs-filter.tsx
│   │   │   │
│   │   │   └── general/
│   │   │       └── ...
│   │   │
│   │   ├── admin/                          # Admin components
│   │   │   ├── sidebar.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── stats-card.tsx
│   │   │   └── forms/
│   │   │       ├── product-form.tsx
│   │   │       ├── category-form.tsx
│   │   │       └── discount-form.tsx
│   │   │
│   │   └── providers/
│   │       ├── query-provider.tsx          # React Query provider
│   │       ├── tenant-provider.tsx
│   │       └── toast-provider.tsx
│   │
│   ├── lib/
│   │   ├── api/                            # API client
│   │   │   ├── client.ts                   # Fetch wrapper
│   │   │   ├── products.ts
│   │   │   ├── categories.ts
│   │   │   ├── cart.ts
│   │   │   ├── orders.ts
│   │   │   ├── auth.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-cart.ts
│   │   │   ├── use-wishlist.ts
│   │   │   ├── use-products.ts
│   │   │   ├── use-search.ts
│   │   │   ├── use-tenant.ts
│   │   │   └── use-debounce.ts
│   │   │
│   │   ├── stores/                         # Zustand stores
│   │   │   ├── cart-store.ts
│   │   │   ├── ui-store.ts
│   │   │   └── filter-store.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                       # classnames utility
│   │   │   ├── format-currency.ts
│   │   │   ├── format-date.ts
│   │   │   └── validation.ts
│   │   │
│   │   ├── tenant/
│   │   │   ├── get-tenant.ts               # Server function
│   │   │   ├── tenant-context.tsx          # Client context
│   │   │   └── template-resolver.ts        # Component resolution
│   │   │
│   │   └── auth/
│   │       └── auth-options.ts             # NextAuth config
│   │
│   ├── styles/
│   │   └── themes/
│   │       ├── auto.css
│   │       ├── fashion.css
│   │       └── general.css
│   │
│   ├── middleware.ts                       # Edge middleware
│   │
│   └── types/
│       ├── product.ts
│       ├── cart.ts
│       ├── order.ts
│       ├── tenant.ts
│       └── next-auth.d.ts
│
├── public/
│   ├── images/
│   └── icons/
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### Next.js Responsibilities

#### Server-Side (SSR/SSG)

| Component | Rendering | Purpose |
|-----------|-----------|---------|
| Homepage | SSR + ISR | Dynamic content, revalidate every 60s |
| Product Listing | SSR | Filtered, searchable, SEO |
| Product Detail | SSR + ISR | SEO, revalidate on update |
| Category Pages | SSR | SEO, filtered products |
| Search Results | SSR | SEO for search queries |
| Static Pages | SSG | About, Contact, Terms |

#### API Routes (BFF)

| Route | Purpose |
|-------|---------|
| `/api/auth/*` | NextAuth.js handlers |
| `/api/cart/*` | Cart operations, session management |
| `/api/checkout/*` | Checkout session, shipping rates |
| `/api/webhooks/*` | Payment provider webhooks |
| `/api/revalidate` | On-demand ISR revalidation |

#### Edge Middleware

| Function | Purpose |
|----------|---------|
| Tenant Detection | Extract tenant from subdomain/domain |
| Geo Routing | Currency, shipping based on location |
| Auth Check | Validate session for protected routes |
| Rate Limiting | Basic rate limiting at edge |

#### Client Components

| Component | Interactivity |
|-----------|---------------|
| Cart Drawer | Add/remove items, quantity updates |
| Search Modal | Real-time search, autocomplete |
| Filter Sidebar | Dynamic filtering |
| Checkout Form | Multi-step form, validation |
| Payment Form | Stripe Elements integration |
| Product Gallery | Image zoom, carousel |
| Variant Selector | Size/color selection |

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Project setup (backend + frontend)
- [ ] Database schema & migrations
- [ ] Core models (Tenant, User, Product, Category)
- [ ] Base repository pattern
- [ ] Authentication (JWT)
- [ ] Tenant middleware
- [ ] Basic API endpoints

### Phase 2: Product & Catalog
- [ ] Product CRUD with variants
- [ ] Category management
- [ ] Product media upload
- [ ] Template-specific attribute validation
- [ ] Search integration (Meilisearch)
- [ ] Filtering & pagination

### Phase 3: Cart & Checkout
- [ ] Cart operations (add, update, remove)
- [ ] Guest cart (session-based)
- [ ] Cart merge on login
- [ ] Discount/coupon system
- [ ] Shipping rate calculation
- [ ] Tax calculation
- [ ] Checkout flow

### Phase 4: Orders & Payments
- [ ] Payment gateway integration (Stripe)
- [ ] Order creation & management
- [ ] Order status workflow
- [ ] Webhook handling
- [ ] Email notifications
- [ ] Order history

### Phase 5: Frontend Templates
- [ ] Base storefront layout
- [ ] General template components
- [ ] Auto dealership template
- [ ] Fashion template
- [ ] Template switching logic

### Phase 6: Admin Panel
- [ ] Admin authentication
- [ ] Dashboard with analytics
- [ ] Product management UI
- [ ] Order management UI
- [ ] Customer management
- [ ] Settings & configuration

### Phase 7: Advanced Features
- [ ] Reviews & ratings
- [ ] Wishlist
- [ ] Inventory management
- [ ] Low stock alerts
- [ ] Multi-currency support
- [ ] Internationalization (i18n)

---

## Environment Variables

### Backend (.env)

```env
# App
NODE_ENV=development
PORT=4000
APP_NAME=ecommerce-api
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# AWS S3 / Cloudflare R2
S3_BUCKET=ecommerce-media
S3_REGION=us-east-1
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=xxx

# Email (SendGrid/Resend)
EMAIL_FROM=noreply@yourplatform.com
SENDGRID_API_KEY=xxx
```

### Frontend (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:4000
BACKEND_URL=http://localhost:4000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Platform
NEXT_PUBLIC_PLATFORM_DOMAIN=yourplatform.com
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- pnpm or yarn

### Backend Setup
```bash
cd backend-template
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### Frontend Setup
```bash
cd frontend-template
cp .env.example .env.local
pnpm install
pnpm dev
```

### Docker Compose (Development)
```bash
docker-compose up -d  # Starts Postgres, Redis, Meilisearch
```
