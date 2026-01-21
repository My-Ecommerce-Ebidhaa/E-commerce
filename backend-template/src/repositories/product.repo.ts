import { injectable } from 'tsyringe';
import { BaseRepository, QueryOptions } from './base.repo';
import { Product } from '@/models/Product.model';
import { ProductStatus } from '@/shared/enums/generic.enum';
import { PaginatedResult } from '@/shared/utils/response.util';
import { Transaction } from 'objection';

export interface ProductQueryParams extends QueryOptions {
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  attributes?: Record<string, unknown>;
}

@injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(Product);
  }

  async findBySlug(tenantId: string, slug: string): Promise<Product | undefined> {
    return Product.query()
      .where('tenant_id', tenantId)
      .where('slug', slug)
      .withGraphFetched('[category, variants, media]')
      .first();
  }

  async findByTenant(
    tenantId: string,
    params: ProductQueryParams = {}
  ): Promise<PaginatedResult<Product>> {
    const {
      page = 1,
      limit = 20,
      orderBy = 'created_at',
      orderDir = 'desc',
      categoryId,
      status,
      minPrice,
      maxPrice,
      search,
      attributes,
      withRelations = ['category', 'media'],
    } = params;

    let query = Product.query().where('tenant_id', tenantId);

    if (categoryId) {
      query = query.where('category_id', categoryId);
    }

    if (status) {
      query = query.where('status', status);
    }

    if (minPrice !== undefined) {
      query = query.where('price', '>=', minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.where('price', '<=', maxPrice);
    }

    if (search) {
      query = query.where((builder) => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`)
          .orWhere('sku', 'ilike', `%${search}%`);
      });
    }

    // JSONB attribute filtering (PostgreSQL specific)
    if (attributes && Object.keys(attributes).length > 0) {
      for (const [key, value] of Object.entries(attributes)) {
        if (value !== undefined && value !== null) {
          query = query.whereRaw(`attributes->>'${key}' = ?`, [String(value)]);
        }
      }
    }

    const offset = (page - 1) * limit;

    const [products, countResult] = await Promise.all([
      query
        .clone()
        .orderBy(orderBy, orderDir)
        .offset(offset)
        .limit(limit)
        .withGraphFetched(`[${withRelations.join(', ')}]`),
      query.clone().count('* as count').first(),
    ]);

    const total = Number((countResult as { count: string })?.count || 0);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findActiveByTenant(
    tenantId: string,
    params: ProductQueryParams = {}
  ): Promise<PaginatedResult<Product>> {
    return this.findByTenant(tenantId, { ...params, status: ProductStatus.ACTIVE });
  }

  async slugExists(
    tenantId: string,
    slug: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = Product.query()
      .where('tenant_id', tenantId)
      .where('slug', slug);

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const count = await query.resultSize();
    return count > 0;
  }

  async getQuantity(productId: string): Promise<number> {
    const product = await Product.query()
      .findById(productId)
      .select('quantity');

    return product?.quantity || 0;
  }

  async decrementQuantity(
    productId: string,
    amount: number,
    trx?: Transaction
  ): Promise<void> {
    const query = trx ? Product.query(trx) : Product.query();
    await query.findById(productId).decrement('quantity', amount);
  }

  async incrementQuantity(
    productId: string,
    amount: number,
    trx?: Transaction
  ): Promise<void> {
    const query = trx ? Product.query(trx) : Product.query();
    await query.findById(productId).increment('quantity', amount);
  }

  async findLowStock(tenantId: string): Promise<Product[]> {
    return Product.query()
      .where('tenant_id', tenantId)
      .where('track_inventory', true)
      .whereRaw('quantity <= low_stock_threshold');
  }
}
