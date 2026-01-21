import { injectable, inject } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@/repositories/user.repo';
import { config } from '@/config';
import {
  hashPassword,
  verifyPassword,
  generateRandomToken,
} from '@/shared/utils/encrypt.util';
import { addMinutes, addDays } from '@/shared/utils/date-time.util';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '@/shared/errors/app.error';
import { User } from '@/models/User.model';
import { UserRole } from '@/shared/enums/generic.enum';
import { JwtPayload } from '@/shared/middlewares/auth.middleware';
import {
  RegisterDto,
  LoginDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

@injectable()
export class AuthService {
  constructor(
    @inject('UserRepository')
    private userRepo: UserRepository
  ) {}

  async register(tenantId: string, dto: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await this.userRepo.findByEmail(
      tenantId,
      dto.email.toLowerCase()
    );

    if (existingUser) {
      throw new ConflictError('Email already registered', 'EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(dto.password);

    // Create user
    const user = await this.userRepo.create({
      tenant_id: tenantId,
      email: dto.email.toLowerCase(),
      password_hash: passwordHash,
      first_name: dto.firstName,
      last_name: dto.lastName,
      phone: dto.phone,
      role: UserRole.CUSTOMER,
      email_verified: false,
    } as Partial<User>);

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  async login(tenantId: string, dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(
      tenantId,
      dto.email.toLowerCase()
    );

    if (!user) {
      throw new UnauthorizedError(
        'Invalid email or password',
        'INVALID_CREDENTIALS'
      );
    }

    if (!user.password_hash) {
      throw new BadRequestError(
        'Account uses social login',
        'SOCIAL_LOGIN_REQUIRED'
      );
    }

    const isValidPassword = await verifyPassword(dto.password, user.password_hash);

    if (!isValidPassword) {
      throw new UnauthorizedError(
        'Invalid email or password',
        'INVALID_CREDENTIALS'
      );
    }

    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as JwtPayload & { type: string };

      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token', 'INVALID_TOKEN');
      }

      const user = await this.userRepo.findById(payload.userId);

      if (!user) {
        throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid refresh token', 'INVALID_TOKEN');
    }
  }

  async forgotPassword(tenantId: string, email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(tenantId, email.toLowerCase());

    // Don't reveal if user exists
    if (!user) {
      return;
    }

    const resetToken = generateRandomToken(32);
    const expiresAt = addMinutes(new Date(), 60); // 1 hour

    await this.userRepo.setResetToken(user.id, resetToken, expiresAt);

    // TODO: Send email with reset link
    // await this.emailService.sendPasswordReset(user.email, resetToken);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepo.findByResetToken(dto.token);

    if (!user) {
      throw new BadRequestError(
        'Invalid or expired reset token',
        'INVALID_RESET_TOKEN'
      );
    }

    const passwordHash = await hashPassword(dto.password);
    await this.userRepo.updatePassword(user.id, passwordHash);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto
  ): Promise<void> {
    const user = await this.userRepo.findById(userId);

    if (!user || !user.password_hash) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const isValidPassword = await verifyPassword(
      dto.currentPassword,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new BadRequestError(
        'Current password is incorrect',
        'INVALID_PASSWORD'
      );
    }

    const passwordHash = await hashPassword(dto.newPassword);
    await this.userRepo.updatePassword(user.id, passwordHash);
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId, ['addresses']);

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return user;
  }

  private generateTokens(user: User): AuthTokens {
    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    // Parse expiresIn to seconds
    const expiresInMatch = config.jwt.expiresIn.match(/^(\d+)([dhms])$/);
    let expiresIn = 3600; // default 1 hour

    if (expiresInMatch) {
      const value = parseInt(expiresInMatch[1], 10);
      const unit = expiresInMatch[2];

      switch (unit) {
        case 'd':
          expiresIn = value * 86400;
          break;
        case 'h':
          expiresIn = value * 3600;
          break;
        case 'm':
          expiresIn = value * 60;
          break;
        case 's':
          expiresIn = value;
          break;
      }
    }

    return { accessToken, refreshToken, expiresIn };
  }
}
