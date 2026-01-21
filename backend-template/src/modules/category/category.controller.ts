import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { ApiResponse } from '@/shared/utils/response';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@injectable()
export class CategoryController {
  constructor(@inject(CategoryService) private categoryService: CategoryService) {}

  findAll = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const includeInactive = req.query.includeInactive === 'true';

    const categories = await this.categoryService.findAll(tenantId, includeInactive);

    res.json(ApiResponse.success(categories));
  };

  findTree = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;

    const tree = await this.categoryService.findTree(tenantId);

    res.json(ApiResponse.success(tree));
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const { id } = req.params;

    const category = await this.categoryService.findById(tenantId, id);

    if (!category) {
      res.status(404).json(ApiResponse.error('Category not found', 404, 'CATEGORY_NOT_FOUND'));
      return;
    }

    res.json(ApiResponse.success(category));
  };

  findBySlug = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const { slug } = req.params;

    const category = await this.categoryService.findBySlug(tenantId, slug);

    if (!category) {
      res.status(404).json(ApiResponse.error('Category not found', 404, 'CATEGORY_NOT_FOUND'));
      return;
    }

    res.json(ApiResponse.success(category));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const dto: CreateCategoryDto = req.body;

    const category = await this.categoryService.create(tenantId, dto);

    res.status(201).json(ApiResponse.success(category, 'Category created successfully'));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const { id } = req.params;
    const dto: UpdateCategoryDto = req.body;

    const category = await this.categoryService.update(tenantId, id, dto);

    res.json(ApiResponse.success(category, 'Category updated successfully'));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenant!.id;
    const { id } = req.params;

    await this.categoryService.delete(tenantId, id);

    res.json(ApiResponse.success(null, 'Category deleted successfully'));
  };
}
