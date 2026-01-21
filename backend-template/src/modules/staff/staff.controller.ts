import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { StaffService } from './staff.service';
import { SuccessResponse, PaginatedResponse } from '@/shared/utils/response.util';
import {
  InviteStaffDto,
  AcceptInvitationDto,
  UpdateStaffDto,
  QueryStaffDto,
} from './dto/staff.dto';
import { ForbiddenError } from '@/shared/errors/app.error';
import { z } from 'zod';

@injectable()
export class StaffController {
  constructor(
    @inject('StaffService')
    private staffService: StaffService
  ) {}

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params: QueryStaffDto = req.query as unknown as QueryStaffDto;
      const result = await this.staffService.findAll(req.tenantId, params);

      res.json(PaginatedResponse('Staff members retrieved', result.data, result.meta));
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
      const staff = await this.staffService.findById(req.tenantId, id);

      res.json(SuccessResponse('Staff member retrieved', { staff }));
    } catch (error) {
      next(error);
    }
  };

  invite = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: InviteStaffDto = req.body;
      const invitation = await this.staffService.inviteStaff(
        req.tenantId,
        dto,
        req.userId!
      );

      res.status(201).json(
        SuccessResponse('Staff invitation sent', { invitation })
      );
    } catch (error) {
      next(error);
    }
  };

  acceptInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: AcceptInvitationDto = req.body;
      const user = await this.staffService.acceptInvitation(dto);

      res.status(201).json(
        SuccessResponse('Invitation accepted, account created', { user })
      );
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
      const dto: UpdateStaffDto = req.body;
      const staff = await this.staffService.updateStaff(req.tenantId, id, dto);

      res.json(SuccessResponse('Staff member updated', { staff }));
    } catch (error) {
      next(error);
    }
  };

  deactivate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      // Prevent self-deactivation
      if (id === req.userId) {
        throw new ForbiddenError(
          'Cannot deactivate your own account',
          'CANNOT_DEACTIVATE_SELF'
        );
      }

      await this.staffService.deactivateStaff(req.tenantId, id);

      res.json(SuccessResponse('Staff member deactivated'));
    } catch (error) {
      next(error);
    }
  };

  reactivate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.staffService.reactivateStaff(req.tenantId, id);

      res.json(SuccessResponse('Staff member reactivated'));
    } catch (error) {
      next(error);
    }
  };

  remove = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      // Prevent self-removal
      if (id === req.userId) {
        throw new ForbiddenError(
          'Cannot remove your own account',
          'CANNOT_REMOVE_SELF'
        );
      }

      await this.staffService.removeStaff(req.tenantId, id);

      res.json(SuccessResponse('Staff member removed'));
    } catch (error) {
      next(error);
    }
  };

  getPendingInvitations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, limit } = req.query as { page?: string; limit?: string };
      const result = await this.staffService.getPendingInvitations(
        req.tenantId,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 20
      );

      res.json(
        PaginatedResponse('Pending invitations retrieved', result.data, result.meta)
      );
    } catch (error) {
      next(error);
    }
  };

  resendInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const invitation = await this.staffService.resendInvitation(
        req.tenantId,
        id
      );

      res.json(SuccessResponse('Invitation resent', { invitation }));
    } catch (error) {
      next(error);
    }
  };

  cancelInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.staffService.cancelInvitation(req.tenantId, id);

      res.json(SuccessResponse('Invitation cancelled'));
    } catch (error) {
      next(error);
    }
  };

  updateRoles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { roleIds } = req.body as { roleIds: string[] };

      await this.staffService.updateStaffRoles(req.tenantId, id, roleIds);

      const staff = await this.staffService.findById(req.tenantId, id);

      res.json(SuccessResponse('Staff roles updated', { staff }));
    } catch (error) {
      next(error);
    }
  };
}
