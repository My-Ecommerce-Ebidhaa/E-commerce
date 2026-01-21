import { injectable, inject } from 'tsyringe';
import { Transaction } from 'objection';
import { RoleRepository, UserRoleRepository } from '@/repositories/role.repo';
import { PermissionRepository } from '@/repositories/permission.repo';
import { UserRepository } from '@/repositories/user.repo';
import { Role } from '@/models/Role.model';
import { Permission } from '@/models/Permission.model';
import { User } from '@/models/User.model';
import { slugify, generateUniqueSlug } from '@/shared/utils/slug.util';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '@/shared/errors/app.error';
import { PaginatedResult } from '@/shared/utils/response.util';
import { getKnex } from '@/database';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto } from './dto/role.dto';

@injectable()
export class RoleService {
  constructor(
    @inject('RoleRepository')
    private roleRepo: RoleRepository,
    @inject('UserRoleRepository')
    private userRoleRepo: UserRoleRepository,
    @inject('PermissionRepository')
    private permissionRepo: PermissionRepository,
    @inject('UserRepository')
    private userRepo: UserRepository
  ) {}

  async findAll(
    tenantId: string,
    params: QueryRoleDto
  ): Promise<PaginatedResult<Role>> {
    return this.roleRepo.findByTenant(tenantId, {
      page: params.page,
      limit: params.limit,
      orderBy: 'created_at',
      orderDir: 'desc',
    });
  }

  async findById(tenantId: string, id: string): Promise<Role> {
    const role = await this.roleRepo.findWithPermissions(id);

    if (!role || role.tenant_id !== tenantId) {
      throw new NotFoundError('Role not found', 'ROLE_NOT_FOUND');
    }

    return role;
  }

  async findBySlug(tenantId: string, slug: string): Promise<Role> {
    const role = await this.roleRepo.findBySlug(tenantId, slug);

    if (!role) {
      throw new NotFoundError('Role not found', 'ROLE_NOT_FOUND');
    }

    return role;
  }

  async create(
    tenantId: string,
    dto: CreateRoleDto,
    createdBy?: string
  ): Promise<Role> {
    // Validate permissions exist
    const permissions = await this.permissionRepo.findByIds(dto.permissionIds);
    if (permissions.length !== dto.permissionIds.length) {
      throw new BadRequestError(
        'One or more permissions not found',
        'INVALID_PERMISSIONS'
      );
    }

    // Generate unique slug
    const existingSlugs = await Role.query()
      .where('tenant_id', tenantId)
      .select('slug')
      .then((roles) => roles.map((r) => r.slug));

    const slug = generateUniqueSlug(dto.name, existingSlugs);

    const knex = getKnex();

    const role = await knex.transaction(async (trx: Transaction) => {
      const newRole = await this.roleRepo.create(
        {
          tenant_id: tenantId,
          name: dto.name,
          slug,
          description: dto.description,
          is_system: false,
        } as Partial<Role>,
        trx
      );

      await this.roleRepo.assignPermissions(newRole.id, dto.permissionIds, trx);

      return newRole;
    });

    return this.findById(tenantId, role.id);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateRoleDto
  ): Promise<Role> {
    const role = await this.findById(tenantId, id);

    // Prevent updating system roles
    if (role.is_system) {
      throw new ForbiddenError(
        'Cannot modify system roles',
        'SYSTEM_ROLE_PROTECTED'
      );
    }

    // Validate permissions if provided
    if (dto.permissionIds) {
      const permissions = await this.permissionRepo.findByIds(dto.permissionIds);
      if (permissions.length !== dto.permissionIds.length) {
        throw new BadRequestError(
          'One or more permissions not found',
          'INVALID_PERMISSIONS'
        );
      }
    }

    // Generate new slug if name changed
    let slug = role.slug;
    if (dto.name && dto.name !== role.name) {
      const existingSlugs = await Role.query()
        .where('tenant_id', tenantId)
        .whereNot('id', id)
        .select('slug')
        .then((roles) => roles.map((r) => r.slug));

      slug = generateUniqueSlug(dto.name, existingSlugs);
    }

    const knex = getKnex();

    await knex.transaction(async (trx: Transaction) => {
      await this.roleRepo.update(
        id,
        {
          ...(dto.name && { name: dto.name, slug }),
          ...(dto.description !== undefined && { description: dto.description }),
        } as Partial<Role>,
        trx
      );

      if (dto.permissionIds) {
        await this.roleRepo.assignPermissions(id, dto.permissionIds, trx);
      }
    });

    return this.findById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const role = await this.findById(tenantId, id);

    // Prevent deleting system roles
    if (role.is_system) {
      throw new ForbiddenError(
        'Cannot delete system roles',
        'SYSTEM_ROLE_PROTECTED'
      );
    }

    // Check if any users have this role
    const userRoles = await this.userRoleRepo.findByRole(id);
    if (userRoles.length > 0) {
      throw new BadRequestError(
        'Cannot delete role with assigned users',
        'ROLE_HAS_USERS'
      );
    }

    await this.roleRepo.delete(id);
  }

  async assignRoleToUser(
    tenantId: string,
    userId: string,
    roleId: string,
    assignedBy?: string
  ): Promise<void> {
    // Verify role belongs to tenant
    const role = await this.findById(tenantId, roleId);

    // Verify user belongs to tenant
    const user = await this.userRepo.findById(userId);
    if (!user || user.tenant_id !== tenantId) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    // Check if already assigned
    const hasRole = await this.userRoleRepo.userHasRole(userId, roleId);
    if (hasRole) {
      throw new BadRequestError(
        'User already has this role',
        'ROLE_ALREADY_ASSIGNED'
      );
    }

    await this.userRoleRepo.assignRole(userId, roleId, assignedBy);
  }

  async removeRoleFromUser(
    tenantId: string,
    userId: string,
    roleId: string
  ): Promise<void> {
    // Verify role belongs to tenant
    await this.findById(tenantId, roleId);

    // Verify user belongs to tenant
    const user = await this.userRepo.findById(userId);
    if (!user || user.tenant_id !== tenantId) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    await this.userRoleRepo.removeRole(userId, roleId);
  }

  async getUserRoles(tenantId: string, userId: string): Promise<Role[]> {
    // Verify user belongs to tenant
    const user = await this.userRepo.findById(userId);
    if (!user || user.tenant_id !== tenantId) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return this.userRoleRepo.getRolesForUser(userId);
  }

  async getUserPermissions(
    tenantId: string,
    userId: string
  ): Promise<Permission[]> {
    // Verify user belongs to tenant
    const user = await this.userRepo.findById(userId);
    if (!user || user.tenant_id !== tenantId) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return this.userRoleRepo.getPermissionsForUser(userId);
  }

  async checkUserPermission(
    userId: string,
    permissionSlug: string
  ): Promise<boolean> {
    return this.userRoleRepo.userHasPermission(userId, permissionSlug);
  }

  async checkUserPermissions(
    userId: string,
    permissionSlugs: string[],
    requireAll = false
  ): Promise<boolean> {
    if (requireAll) {
      return this.userRoleRepo.userHasAllPermissions(userId, permissionSlugs);
    }
    return this.userRoleRepo.userHasAnyPermission(userId, permissionSlugs);
  }

  async getAllPermissions(): Promise<Record<string, Permission[]>> {
    return this.permissionRepo.getAllGroupedByModule();
  }

  async getRoleUsers(
    tenantId: string,
    roleId: string
  ): Promise<User[]> {
    // Verify role belongs to tenant
    await this.findById(tenantId, roleId);

    const userRoles = await this.userRoleRepo.findByRole(roleId);
    const userIds = userRoles.map((ur) => ur.user_id);

    if (userIds.length === 0) {
      return [];
    }

    return User.query()
      .whereIn('id', userIds)
      .where('tenant_id', tenantId);
  }
}
