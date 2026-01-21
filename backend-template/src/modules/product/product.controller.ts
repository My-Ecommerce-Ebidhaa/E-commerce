import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { SuccessResponse, PaginatedResponse } from '@/shared/utils/response.util';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/product.dto';

@injectable()
export class ProductController {
  constructor(
    @inject('ProductService')
    private productService: ProductService
  ) {}

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params: QueryProductDto = req.query as unknown as QueryProductDto;
      const result = await this.productService.findAll(req.tenantId, params);

      res.json(PaginatedResponse('Products retrieved', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  };

  findBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const product = await this.productService.findBySlug(req.tenantId, slug);

      res.json(SuccessResponse('Product retrieved', { product }));
    } catch (error) {
      next(error);
    }
  };

  findById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.findById(req.tenantId, id);

      res.json(SuccessResponse('Product retrieved', { product }));
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: CreateProductDto = req.body;
      const product = await this.productService.create(req.tenantId, dto);

      res.status(201).json(SuccessResponse('Product created', { product }));
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: UpdateProductDto = req.body;
      const product = await this.productService.update(req.tenantId, id, dto);

      res.json(SuccessResponse('Product updated', { product }));
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.productService.delete(req.tenantId, id);

      res.json(SuccessResponse('Product deleted'));
    } catch (error) {
      next(error);
    }
  };

  updateInventory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const product = await this.productService.updateInventory(
        req.tenantId,
        id,
        quantity
      );

      res.json(SuccessResponse('Inventory updated', { product }));
    } catch (error) {
      next(error);
    }
  };
}
