import { z } from 'zod';

export const inviteStaffSchema = z.object({
  email: z.string().email(),
  roleId: z.string().uuid(),
  message: z.string().max(500).optional(),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
});

export const updateStaffSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

export const queryStaffSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const resendInvitationSchema = z.object({
  invitationId: z.string().uuid(),
});

export type InviteStaffDto = z.infer<typeof inviteStaffSchema>;
export type AcceptInvitationDto = z.infer<typeof acceptInvitationSchema>;
export type UpdateStaffDto = z.infer<typeof updateStaffSchema>;
export type QueryStaffDto = z.infer<typeof queryStaffSchema>;
export type ResendInvitationDto = z.infer<typeof resendInvitationSchema>;
