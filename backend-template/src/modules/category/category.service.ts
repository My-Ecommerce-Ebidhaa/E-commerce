import { injectable, inject } from 'tsyringe';
import { CategoryRepository } from '@/repositories/category.repo';
import { AppError } from '@/shared/errors/app-error';
import { Category } from '@/models/Category.model';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

@injectable()
export class CategoryService {
  constructor(
    @inject(CategoryRepository) private categoryRepo: CategoryRepository
  ) {}

  async findAll(tenantId: string, includeInactive: boolean = false): Promise<Category[]> {
    return this.categoryRepo.findByTenant(tenantId, includeInactive);
  }

  async findById(tenantId: string, categoryId: string): Promise<Category | null> {
    const category = await this.categoryRepo.findById(categoryId);
    if (!category || category.tenant_id !== tenantId) {
      return null;
    }
    return category;
  }

  async findBySlug(tenantId: string, slug: string): Promise<Category | null> {
    return this.categoryRepo.findBySlug(tenantId, slug);
  }

  async findTree(tenantId: string): Promise<Category[]> {
    return this.categoryRepo.findTree(tenantId);
  }

  async create(tenantId: string, dto: CreateCategoryDto): Promise<Category> {
    // Generate slug if not provided
    const slug = dto.slug || slugify(dto.name, { lower: true, strict: true });

    // Check slug uniqueness
    const existing = await this.categoryRepo.findBySlug(tenantId, slug);
    if (existing) {
      throw new AppError('Category with this slug already exists', 400, 'DUPLICATE_SLUG');
    }

    // Validate parent if provided
    if (dto.parentId) {
      const parent = await this.findById(tenantId, dto.parentId);
      if (!parent) {
        throw new AppError('Parent category not found', 404, 'PARENT_NOT_FOUND');
      }
    }

    const category = await this.categoryRepo.create({
      id: uuidv4(),
      tenant_id: tenantId,
      name: dto.name,
      slug,
      description: dto.description || null,
      image: dto.image || null,
      parent_id: dto.parentId || null,
      position: dto.position ?? 0,
      is_active: dto.isActive ?? true,
    });

    return category;
  }

  async update(
    tenantId: string,
    categoryId: string,
    dto: UpdateCategoryDto
  ): Promise<Category> {
    const category = await this.findById(tenantId, categoryId);
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    // Check slug uniqueness if changing
    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepo.findBySlug(tenantId, dto.slug);
      if (existing) {
        throw new AppError('Category with this slug already exists', 400, 'DUPLICATE_SLUG');
      }
    }

    // Validate parent if changing
    if (dto.parentId !== undefined && dto.parentId !== category.parent_id) {
      if (dto.parentId) {
        // Prevent circular reference
        if (dto.parentId === categoryId) {
          throw new AppError('Category cannot be its own parent', 400, 'CIRCULAR_REFERENCE');
        }

        const parent = await this.findById(tenantId, dto.parentId);
        if (!parent) {
          throw new AppError('Parent category not found', 404, 'PARENT_NOT_FOUND');
        }

        // Check if new parent is a descendant
        const descendants = await this.getDescendantIds(categoryId);
        if (descendants.includes(dto.parentId)) {
          throw new AppError('Cannot set a descendant as parent', 400, 'CIRCULAR_REFERENCE');
        }
      }
    }

    const updateData: Partial<Category> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.image !== undefined) updateData.image = dto.image;
    if (dto.parentId !== undefined) updateData.parent_id = dto.parentId;
    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    return this.categoryRepo.update(categoryId, updateData);
  }

  async delete(tenantId: string, categoryId: string): Promise<void> {
    const category = await this.findById(tenantId, categoryId);
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    // Check if category has children
    const children = await Category.query()
      .where('parent_id', categoryId)
      .first();

    if (children) {
      throw new AppError(
        'Cannot delete category with children. Delete or reassign children first.',
        400,
        'HAS_CHILDREN'
      );
    }

    // Check if category has products
    const hasProducts = await this.categoryRepo.hasProducts(categoryId);
    if (hasProducts) {
      throw new AppError(
        'Cannot delete category with products. Delete or reassign products first.',
        400,
        'HAS_PRODUCTS'
      );
    }

    await this.categoryRepo.delete(categoryId);
  }

  private async getDescendantIds(categoryId: string): Promise<string[]> {
    const descendants: string[] = [];
    const queue = [categoryId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = await Category.query().where('parent_id', currentId);

      for (const child of children) {
        descendants.push(child.id);
        queue.push(child.id);
      }
    }

    return descendants;
  }
}
