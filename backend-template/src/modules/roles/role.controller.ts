import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { SuccessResponse, PaginatedResponse } from '@/shared/utils/response.util';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
  AssignRoleDto,
  RemoveRoleDto,
} from './dto/role.dto';

@injectable()
export class RoleController {
  constructor(
    @inject('RoleService')
    private roleService: RoleService
  ) {}

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params: QueryRoleDto = req.query as unknown as QueryRoleDto;
      const result = await this.roleService.findAll(req.tenantId, params);

      res.json(PaginatedResponse('Roles retrieved', result.data, result.meta));
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
      const role = await this.roleService.findById(req.tenantId, id);

      res.json(SuccessResponse('Role retrieved', { role }));
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
      const dto: CreateRoleDto = req.body;
      const role = await this.roleService.create(
        req.tenantId,
        dto,
        req.userId
      );

      res.status(201).json(SuccessResponse('Role created', { role }));
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
      const dto: UpdateRoleDto = req.body;
      const role = await this.roleService.update(req.tenantId, id, dto);

      res.json(SuccessResponse('Role updated', { role }));
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
      await this.roleService.delete(req.tenantId, id);

      res.json(SuccessResponse('Role deleted'));
    } catch (error) {
      next(error);
    }
  };

  assignRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId, roleId }: AssignRoleDto = req.body;
      await this.roleService.assignRoleToUser(
        req.tenantId,
        userId,
        roleId,
        req.userId
      );

      res.json(SuccessResponse('Role assigned to user'));
    } catch (error) {
      next(error);
    }
  };

  removeRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId, roleId }: RemoveRoleDto = req.body;
      await this.roleService.removeRoleFromUser(req.tenantId, userId, roleId);

      res.json(SuccessResponse('Role removed from user'));
    } catch (error) {
      next(error);
    }
  };

  getUserRoles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const roles = await this.roleService.getUserRoles(req.tenantId, userId);

      res.json(SuccessResponse('User roles retrieved', { roles }));
    } catch (error) {
      next(error);
    }
  };

  getUserPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const permissions = await this.roleService.getUserPermissions(
        req.tenantId,
        userId
      );

      res.json(SuccessResponse('User permissions retrieved', { permissions }));
    } catch (error) {
      next(error);
    }
  };

  getMyPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const permissions = await this.roleService.getUserPermissions(
        req.tenantId,
        req.userId!
      );

      res.json(SuccessResponse('My permissions retrieved', { permissions }));
    } catch (error) {
      next(error);
    }
  };

  getAllPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const permissions = await this.roleService.getAllPermissions();

      res.json(SuccessResponse('All permissions retrieved', { permissions }));
    } catch (error) {
      next(error);
    }
  };

  getRoleUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const users = await this.roleService.getRoleUsers(req.tenantId, id);

      res.json(SuccessResponse('Role users retrieved', { users }));
    } catch (error) {
      next(error);
    }
  };
}
