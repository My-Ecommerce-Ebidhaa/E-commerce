import { injectable, inject } from 'tsyringe';
import { Transaction } from 'objection';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '@/repositories/user.repo';
import {
  RoleRepository,
  UserRoleRepository,
  StaffInvitationRepository,
} from '@/repositories/role.repo';
import { User } from '@/models/User.model';
import { StaffInvitation } from '@/models/Role.model';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '@/shared/errors/app.error';
import { PaginatedResult } from '@/shared/utils/response.util';
import { getKnex } from '@/database';
import { UserRole } from '@/shared/enums/generic.enum';
import {
  InviteStaffDto,
  AcceptInvitationDto,
  UpdateStaffDto,
  QueryStaffDto,
} from './dto/staff.dto';

@injectable()
export class StaffService {
  constructor(
    @inject('UserRepository')
    private userRepo: UserRepository,
    @inject('RoleRepository')
    private roleRepo: RoleRepository,
    @inject('UserRoleRepository')
    private userRoleRepo: UserRoleRepository,
    @inject('StaffInvitationRepository')
    private invitationRepo: StaffInvitationRepository
  ) {}

  async findAll(
    tenantId: string,
    params: QueryStaffDto
  ): Promise<PaginatedResult<User>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    let query = User.query()
      .where('tenant_id', tenantId)
      .whereIn('role', [UserRole.ADMIN, UserRole.STAFF]);

    if (params.search) {
      query = query.where((builder) => {
        builder
          .where('email', 'ilike', `%${params.search}%`)
          .orWhere('first_name', 'ilike', `%${params.search}%`)
          .orWhere('last_name', 'ilike', `%${params.search}%`);
      });
    }

    if (params.isActive !== undefined) {
      query = query.where('is_active', params.isActive);
    }

    const [data, countResult] = await Promise.all([
      query.clone().offset(offset).limit(limit).orderBy('created_at', 'desc'),
      query.clone().count('* as count').first(),
    ]);

    const total = Number((countResult as { count: string })?.count || 0);

    // Fetch roles for each staff member
    const staffWithRoles = await Promise.all(
      data.map(async (staff) => {
        const roles = await this.userRoleRepo.getRolesForUser(staff.id);
        return { ...staff, roles };
      })
    );

    return {
      data: staffWithRoles as User[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(tenantId: string, id: string): Promise<User & { roles: any[] }> {
    const user = await this.userRepo.findById(id);

    if (!user || user.tenant_id !== tenantId) {
      throw new NotFoundError('Staff member not found', 'STAFF_NOT_FOUND');
    }

    const roles = await this.userRoleRepo.getRolesForUser(id);

    return { ...user, roles } as User & { roles: any[] };
  }

  async inviteStaff(
    tenantId: string,
    dto: InviteStaffDto,
    invitedBy: string
  ): Promise<StaffInvitation> {
    // Check if role belongs to tenant
    const role = await this.roleRepo.findById(dto.roleId);
    if (!role || role.tenant_id !== tenantId) {
      throw new NotFoundError('Role not found', 'ROLE_NOT_FOUND');
    }

    // Check if email already exists as a user
    const existingUser = await this.userRepo.findByEmail(
      tenantId,
      dto.email.toLowerCase()
    );
    if (existingUser) {
      throw new ConflictError(
        'User with this email already exists',
        'EMAIL_EXISTS'
      );
    }

    // Check for pending invitation
    const existingInvitation = await this.invitationRepo.findByEmail(
      tenantId,
      dto.email.toLowerCase()
    );
    if (existingInvitation) {
      throw new ConflictError(
        'Pending invitation already exists for this email',
        'INVITATION_EXISTS'
      );
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');

    // Set expiration (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.invitationRepo.create({
      tenant_id: tenantId,
      email: dto.email.toLowerCase(),
      role_id: dto.roleId,
      invited_by: invitedBy,
      token,
      expires_at: expiresAt.toISOString(),
    } as Partial<StaffInvitation>);

    // TODO: Send invitation email
    // await this.emailService.sendStaffInvitation(invitation, dto.message);

    return invitation;
  }

  async acceptInvitation(dto: AcceptInvitationDto): Promise<User> {
    const invitation = await this.invitationRepo.findByToken(dto.token);

    if (!invitation) {
      throw new NotFoundError(
        'Invalid or expired invitation',
        'INVALID_INVITATION'
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const knex = getKnex();

    const user = await knex.transaction(async (trx: Transaction) => {
      // Create user
      const newUser = await User.query(trx).insert({
        tenant_id: invitation.tenant_id,
        email: invitation.email,
        password_hash: passwordHash,
        first_name: dto.firstName,
        last_name: dto.lastName,
        role: UserRole.STAFF,
        email_verified: true, // Verified through invitation
        is_active: true,
      });

      // Assign role
      await this.userRoleRepo.assignRole(
        newUser.id,
        invitation.role_id,
        invitation.invited_by,
        trx
      );

      // Mark invitation as accepted
      await this.invitationRepo.markAccepted(invitation.id, trx);

      return newUser;
    });

    return user;
  }

  async updateStaff(
    tenantId: string,
    id: string,
    dto: UpdateStaffDto
  ): Promise<User> {
    const user = await this.findById(tenantId, id);

    const updateData: Partial<User> = {
      ...(dto.firstName !== undefined && { first_name: dto.firstName }),
      ...(dto.lastName !== undefined && { last_name: dto.lastName }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.isActive !== undefined && { is_active: dto.isActive }),
    };

    if (Object.keys(updateData).length > 0) {
      await this.userRepo.update(id, updateData);
    }

    return this.findById(tenantId, id);
  }

  async deactivateStaff(tenantId: string, id: string): Promise<void> {
    const user = await this.findById(tenantId, id);

    // Prevent self-deactivation
    // This check should happen in the controller based on req.userId

    await this.userRepo.update(id, { is_active: false } as Partial<User>);
  }

  async reactivateStaff(tenantId: string, id: string): Promise<void> {
    await this.findById(tenantId, id);
    await this.userRepo.update(id, { is_active: true } as Partial<User>);
  }

  async removeStaff(tenantId: string, id: string): Promise<void> {
    const user = await this.findById(tenantId, id);

    const knex = getKnex();

    await knex.transaction(async (trx: Transaction) => {
      // Remove all roles
      await this.userRoleRepo.removeAllRoles(id, trx);

      // Delete user
      await User.query(trx).deleteById(id);
    });
  }

  async getPendingInvitations(
    tenantId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResult<StaffInvitation>> {
    return this.invitationRepo.findPendingByTenant(tenantId, { page, limit });
  }

  async resendInvitation(
    tenantId: string,
    invitationId: string
  ): Promise<StaffInvitation> {
    const invitation = await this.invitationRepo.findById(invitationId);

    if (!invitation || invitation.tenant_id !== tenantId) {
      throw new NotFoundError('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    if (invitation.accepted_at) {
      throw new BadRequestError(
        'Invitation has already been accepted',
        'INVITATION_ACCEPTED'
      );
    }

    // Generate new token and extend expiration
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.invitationRepo.update(invitationId, {
      token,
      expires_at: expiresAt.toISOString(),
    } as Partial<StaffInvitation>);

    const updatedInvitation = await this.invitationRepo.findById(invitationId);

    // TODO: Resend invitation email
    // await this.emailService.sendStaffInvitation(updatedInvitation);

    return updatedInvitation!;
  }

  async cancelInvitation(tenantId: string, invitationId: string): Promise<void> {
    const invitation = await this.invitationRepo.findById(invitationId);

    if (!invitation || invitation.tenant_id !== tenantId) {
      throw new NotFoundError('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    if (invitation.accepted_at) {
      throw new BadRequestError(
        'Cannot cancel accepted invitation',
        'INVITATION_ACCEPTED'
      );
    }

    await this.invitationRepo.delete(invitationId);
  }

  async updateStaffRoles(
    tenantId: string,
    staffId: string,
    roleIds: string[]
  ): Promise<void> {
    const user = await this.findById(tenantId, staffId);

    // Validate all roles belong to tenant
    for (const roleId of roleIds) {
      const role = await this.roleRepo.findById(roleId);
      if (!role || role.tenant_id !== tenantId) {
        throw new NotFoundError(`Role ${roleId} not found`, 'ROLE_NOT_FOUND');
      }
    }

    const knex = getKnex();

    await knex.transaction(async (trx: Transaction) => {
      // Remove all existing roles
      await this.userRoleRepo.removeAllRoles(staffId, trx);

      // Assign new roles
      for (const roleId of roleIds) {
        await this.userRoleRepo.assignRole(staffId, roleId, undefined, trx);
      }
    });
  }
}
