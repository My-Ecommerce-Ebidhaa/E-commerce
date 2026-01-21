import { injectable, inject } from 'tsyringe';
import { Transaction } from 'objection';
import { ProductRepository } from '@/repositories/product.repo';
import { CategoryRepository } from '@/repositories/category.repo';
import { TenantRepository } from '@/repositories/tenant.repo';
import { Product } from '@/models/Product.model';
import { ProductVariant } from '@/models/ProductVariant.model';
import { ProductMedia } from '@/models/ProductMedia.model';
import { slugify, generateUniqueSlug } from '@/shared/utils/slug.util';
import { NotFoundError, BadRequestError, ValidationError } from '@/shared/errors/app.error';
import { PaginatedResult } from '@/shared/utils/response.util';
import { getKnex } from '@/database';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
  attributeSchemas,
} from './dto/product.dto';

@injectable()
export class ProductService {
  constructor(
    @inject('ProductRepository')
    private productRepo: ProductRepository,
    @inject('CategoryRepository')
    private categoryRepo: CategoryRepository,
    @inject('TenantRepository')
    private tenantRepo: TenantRepository
  ) {}

  async findAll(
    tenantId: string,
    params: QueryProductDto
  ): Promise<PaginatedResult<Product>> {
    return this.productRepo.findByTenant(tenantId, {
      page: params.page,
      limit: params.limit,
      orderBy: params.orderBy,
      orderDir: params.orderDir,
      categoryId: params.categoryId,
      status: params.status,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      search: params.search,
    });
  }

  async findBySlug(tenantId: string, slug: string): Promise<Product> {
    const product = await this.productRepo.findBySlug(tenantId, slug);

    if (!product) {
      throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
    }

    return product;
  }

  async findById(tenantId: string, id: string): Promise<Product> {
    const product = await this.productRepo.findById(id, [
      'category',
      'variants',
      'media',
    ]);

    if (!product || product.tenant_id !== tenantId) {
      throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
    }

    return product;
  }

  async create(tenantId: string, dto: CreateProductDto): Promise<Product> {
    // Get tenant for template type validation
    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant not found', 'TENANT_NOT_FOUND');
    }

    // Validate attributes against template schema
    if (dto.attributes && Object.keys(dto.attributes).length > 0) {
      const schema = attributeSchemas[tenant.template_type];
      const result = schema.safeParse(dto.attributes);
      if (!result.success) {
        throw new ValidationError(
          'Invalid product attributes for template type',
          { attributes: result.error.errors.map((e) => e.message) }
        );
      }
    }

    // Validate category if provided
    if (dto.categoryId) {
      const category = await this.categoryRepo.findById(dto.categoryId);
      if (!category || category.tenant_id !== tenantId) {
        throw new BadRequestError('Invalid category', 'INVALID_CATEGORY');
      }
    }

    // Generate unique slug
    const existingSlugs = await Product.query()
      .where('tenant_id', tenantId)
      .select('slug')
      .then((products) => products.map((p) => p.slug));

    const slug = generateUniqueSlug(dto.name, existingSlugs);

    const knex = getKnex();

    // Use transaction for creating product with variants and media
    const product = await knex.transaction(async (trx: Transaction) => {
      const newProduct = await this.productRepo.create(
        {
          tenant_id: tenantId,
          category_id: dto.categoryId,
          name: dto.name,
          slug,
          description: dto.description,
          short_description: dto.shortDescription,
          status: dto.status,
          price: dto.price,
          compare_at_price: dto.compareAtPrice,
          cost_price: dto.costPrice,
          sku: dto.sku,
          barcode: dto.barcode,
          track_inventory: dto.trackInventory,
          quantity: dto.quantity,
          low_stock_threshold: dto.lowStockThreshold,
          attributes: dto.attributes || {},
          meta_title: dto.metaTitle,
          meta_description: dto.metaDescription,
        } as Partial<Product>,
        trx
      );

      // Create variants
      if (dto.variants && dto.variants.length > 0) {
        const variantData = dto.variants.map((v) => ({
          product_id: newProduct.id,
          name: v.name,
          sku: v.sku,
          price: v.price,
          quantity: v.quantity,
          options: v.options,
        }));

        await ProductVariant.query(trx).insert(variantData);
      }

      // Create media
      if (dto.media && dto.media.length > 0) {
        const mediaData = dto.media.map((m, index) => ({
          product_id: newProduct.id,
          type: m.type,
          url: m.url,
          alt_text: m.altText,
          position: m.position ?? index,
        }));

        await ProductMedia.query(trx).insert(mediaData);
      }

      return newProduct;
    });

    // Return with relations
    return this.findById(tenantId, product.id);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateProductDto
  ): Promise<Product> {
    const product = await this.findById(tenantId, id);

    // Get tenant for template type validation
    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant not found', 'TENANT_NOT_FOUND');
    }

    // Validate attributes if provided
    if (dto.attributes && Object.keys(dto.attributes).length > 0) {
      const schema = attributeSchemas[tenant.template_type];
      const result = schema.safeParse(dto.attributes);
      if (!result.success) {
        throw new ValidationError(
          'Invalid product attributes for template type',
          { attributes: result.error.errors.map((e) => e.message) }
        );
      }
    }

    // Validate category if changed
    if (dto.categoryId && dto.categoryId !== product.category_id) {
      const category = await this.categoryRepo.findById(dto.categoryId);
      if (!category || category.tenant_id !== tenantId) {
        throw new BadRequestError('Invalid category', 'INVALID_CATEGORY');
      }
    }

    // Generate new slug if name changed
    let slug = product.slug;
    if (dto.name && dto.name !== product.name) {
      const existingSlugs = await Product.query()
        .where('tenant_id', tenantId)
        .whereNot('id', id)
        .select('slug')
        .then((products) => products.map((p) => p.slug));

      slug = generateUniqueSlug(dto.name, existingSlugs);
    }

    const updateData: Partial<Product> = {
      ...(dto.name && { name: dto.name, slug }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.shortDescription !== undefined && { short_description: dto.shortDescription }),
      ...(dto.categoryId !== undefined && { category_id: dto.categoryId }),
      ...(dto.status && { status: dto.status }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.compareAtPrice !== undefined && { compare_at_price: dto.compareAtPrice }),
      ...(dto.costPrice !== undefined && { cost_price: dto.costPrice }),
      ...(dto.sku !== undefined && { sku: dto.sku }),
      ...(dto.barcode !== undefined && { barcode: dto.barcode }),
      ...(dto.trackInventory !== undefined && { track_inventory: dto.trackInventory }),
      ...(dto.quantity !== undefined && { quantity: dto.quantity }),
      ...(dto.lowStockThreshold !== undefined && { low_stock_threshold: dto.lowStockThreshold }),
      ...(dto.attributes && { attributes: dto.attributes }),
      ...(dto.metaTitle !== undefined && { meta_title: dto.metaTitle }),
      ...(dto.metaDescription !== undefined && { meta_description: dto.metaDescription }),
    };

    await this.productRepo.update(id, updateData);

    return this.findById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const product = await this.findById(tenantId, id);

    // Check if product has orders (optional: prevent deletion)
    // const orderCount = await OrderItem.query().where('product_id', id).resultSize();
    // if (orderCount > 0) {
    //   throw new BadRequestError('Cannot delete product with orders', 'PRODUCT_HAS_ORDERS');
    // }

    await this.productRepo.delete(id);
  }

  async updateInventory(
    tenantId: string,
    id: string,
    quantity: number
  ): Promise<Product> {
    const product = await this.findById(tenantId, id);

    await this.productRepo.update(id, { quantity } as Partial<Product>);

    return this.findById(tenantId, id);
  }
}
