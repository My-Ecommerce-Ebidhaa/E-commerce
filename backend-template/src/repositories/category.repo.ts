import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repo';
import { Category } from '@/models/Category.model';

@injectable()
export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category);
  }

  async findBySlug(tenantId: string, slug: string): Promise<Category | undefined> {
    return Category.query()
      .where('tenant_id', tenantId)
      .where('slug', slug)
      .withGraphFetched('[children, parent]')
      .first();
  }

  async findByTenant(tenantId: string, includeInactive: boolean = false): Promise<Category[]> {
    let query = Category.query()
      .where('tenant_id', tenantId)
      .orderBy('position', 'asc')
      .withGraphFetched('children');

    if (!includeInactive) {
      query = query.where('is_active', true);
    }

    return query;
  }

  async findTree(tenantId: string): Promise<Category[]> {
    return this.findRootCategories(tenantId);
  }

  async hasProducts(categoryId: string): Promise<boolean> {
    const { Product } = await import('@/models/Product.model');
    const count = await Product.query()
      .where('category_id', categoryId)
      .resultSize();
    return count > 0;
  }

  async findRootCategories(tenantId: string): Promise<Category[]> {
    return Category.query()
      .where('tenant_id', tenantId)
      .whereNull('parent_id')
      .where('is_active', true)
      .orderBy('position', 'asc')
      .withGraphFetched('children(active)')
      .modifiers({
        active(builder) {
          builder.where('is_active', true).orderBy('position', 'asc');
        },
      });
  }

  async findActiveByTenant(tenantId: string): Promise<Category[]> {
    return Category.query()
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .orderBy('position', 'asc');
  }

  async slugExists(
    tenantId: string,
    slug: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = Category.query()
      .where('tenant_id', tenantId)
      .where('slug', slug);

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const count = await query.resultSize();
    return count > 0;
  }

  async getMaxPosition(tenantId: string, parentId?: string): Promise<number> {
    let query = Category.query()
      .where('tenant_id', tenantId)
      .max('position as maxPosition');

    if (parentId) {
      query = query.where('parent_id', parentId);
    } else {
      query = query.whereNull('parent_id');
    }

    const result = await query.first();
    return (result as { maxPosition: number })?.maxPosition || 0;
  }

  async reorderCategories(
    tenantId: string,
    categoryIds: string[]
  ): Promise<void> {
    const updates = categoryIds.map((id, index) =>
      Category.query()
        .where('tenant_id', tenantId)
        .where('id', id)
        .patch({ position: index })
    );

    await Promise.all(updates);
  }
}
