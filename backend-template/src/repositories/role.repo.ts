import { injectable } from 'tsyringe';
import { Transaction } from 'objection';
import { BaseRepository, QueryOptions } from './base.repo';
import { Role, RolePermission, UserRole, StaffInvitation } from '@/models/Role.model';
import { Permission } from '@/models/Permission.model';
import { PaginatedResult } from '@/shared/utils/response.util';

@injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role);
  }

  async findByTenant(
    tenantId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<Role>> {
    return this.paginate({ tenant_id: tenantId } as Partial<Role>, {
      ...options,
      withRelations: options?.withRelations || ['permissions'],
    });
  }

  async findBySlug(tenantId: string, slug: string): Promise<Role | undefined> {
    return Role.query()
      .where('tenant_id', tenantId)
      .where('slug', slug)
      .withGraphFetched('permissions')
      .first();
  }

  async findWithPermissions(id: string): Promise<Role | undefined> {
    return Role.query().findById(id).withGraphFetched('permissions');
  }

  async slugExists(
    tenantId: string,
    slug: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = Role.query()
      .where('tenant_id', tenantId)
      .where('slug', slug);

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const count = await query.resultSize();
    return count > 0;
  }

  async assignPermissions(
    roleId: string,
    permissionIds: string[],
    trx?: Transaction
  ): Promise<void> {
    const query = trx ? RolePermission.query(trx) : RolePermission.query();

    // Delete existing permissions
    await query.delete().where('role_id', roleId);

    // Insert new permissions
    if (permissionIds.length > 0) {
      const insertQuery = trx ? RolePermission.query(trx) : RolePermission.query();
      await insertQuery.insert(
        permissionIds.map((permissionId) => ({
          role_id: roleId,
          permission_id: permissionId,
        }))
      );
    }
  }

  async getPermissionsForRole(roleId: string): Promise<Permission[]> {
    const role = await Role.query()
      .findById(roleId)
      .withGraphFetched('permissions');

    return role?.permissions || [];
  }
}

@injectable()
export class UserRoleRepository extends BaseRepository<UserRole> {
  constructor() {
    super(UserRole);
  }

  async findByUser(userId: string): Promise<UserRole[]> {
    return UserRole.query().where('user_id', userId);
  }

  async findByRole(roleId: string): Promise<UserRole[]> {
    return UserRole.query().where('role_id', roleId);
  }

  async userHasRole(userId: string, roleId: string): Promise<boolean> {
    const count = await UserRole.query()
      .where('user_id', userId)
      .where('role_id', roleId)
      .resultSize();

    return count > 0;
  }

  async assignRole(
    userId: string,
    roleId: string,
    assignedBy?: string,
    trx?: Transaction
  ): Promise<UserRole> {
    const query = trx ? UserRole.query(trx) : UserRole.query();
    return query.insert({
      user_id: userId,
      role_id: roleId,
      assigned_by: assignedBy,
    }) as unknown as UserRole;
  }

  async removeRole(userId: string, roleId: string, trx?: Transaction): Promise<number> {
    const query = trx ? UserRole.query(trx) : UserRole.query();
    return query.delete().where('user_id', userId).where('role_id', roleId);
  }

  async removeAllRoles(userId: string, trx?: Transaction): Promise<number> {
    const query = trx ? UserRole.query(trx) : UserRole.query();
    return query.delete().where('user_id', userId);
  }

  async getRolesForUser(userId: string): Promise<Role[]> {
    const userRoles = await UserRole.query()
      .where('user_id', userId)
      .select('role_id');

    if (userRoles.length === 0) {
      return [];
    }

    return Role.query()
      .whereIn(
        'id',
        userRoles.map((ur) => ur.role_id)
      )
      .withGraphFetched('permissions');
  }

  async getPermissionsForUser(userId: string): Promise<Permission[]> {
    const roles = await this.getRolesForUser(userId);

    // Flatten and dedupe permissions
    const permissionMap = new Map<string, Permission>();
    for (const role of roles) {
      for (const permission of role.permissions || []) {
        permissionMap.set(permission.id, permission);
      }
    }

    return Array.from(permissionMap.values());
  }

  async userHasPermission(userId: string, permissionSlug: string): Promise<boolean> {
    const permissions = await this.getPermissionsForUser(userId);
    return permissions.some((p) => p.slug === permissionSlug);
  }

  async userHasAnyPermission(
    userId: string,
    permissionSlugs: string[]
  ): Promise<boolean> {
    const permissions = await this.getPermissionsForUser(userId);
    return permissions.some((p) => permissionSlugs.includes(p.slug));
  }

  async userHasAllPermissions(
    userId: string,
    permissionSlugs: string[]
  ): Promise<boolean> {
    const permissions = await this.getPermissionsForUser(userId);
    const userPermissionSlugs = permissions.map((p) => p.slug);
    return permissionSlugs.every((slug) => userPermissionSlugs.includes(slug));
  }
}

@injectable()
export class StaffInvitationRepository extends BaseRepository<StaffInvitation> {
  constructor() {
    super(StaffInvitation);
  }

  async findByToken(token: string): Promise<StaffInvitation | undefined> {
    return StaffInvitation.query()
      .where('token', token)
      .where('expires_at', '>', new Date())
      .whereNull('accepted_at')
      .withGraphFetched('role')
      .first();
  }

  async findByEmail(
    tenantId: string,
    email: string
  ): Promise<StaffInvitation | undefined> {
    return StaffInvitation.query()
      .where('tenant_id', tenantId)
      .where('email', email.toLowerCase())
      .whereNull('accepted_at')
      .first();
  }

  async findPendingByTenant(
    tenantId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<StaffInvitation>> {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 20));
    const offset = (page - 1) * limit;

    const query = StaffInvitation.query()
      .where('tenant_id', tenantId)
      .whereNull('accepted_at')
      .where('expires_at', '>', new Date());

    const [data, countResult] = await Promise.all([
      query.clone().offset(offset).limit(limit).withGraphFetched('role'),
      query.clone().count('* as count').first(),
    ]);

    const total = Number((countResult as { count: string })?.count || 0);

    return {
      data: data as StaffInvitation[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAccepted(id: string, trx?: Transaction): Promise<void> {
    const query = trx ? StaffInvitation.query(trx) : StaffInvitation.query();
    await query.patchAndFetchById(id, { accepted_at: new Date().toISOString() });
  }

  async deleteExpired(tenantId: string): Promise<number> {
    return StaffInvitation.query()
      .delete()
      .where('tenant_id', tenantId)
      .where('expires_at', '<', new Date())
      .whereNull('accepted_at');
  }
}
