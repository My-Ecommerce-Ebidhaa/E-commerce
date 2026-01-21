import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { SuccessResponse } from '@/shared/utils/response.util';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from './dto/auth.dto';

@injectable()
export class AuthController {
  constructor(
    @inject('AuthService')
    private authService: AuthService
  ) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: RegisterDto = req.body;
      const result = await this.authService.register(req.tenantId, dto);

      res.status(201).json(
        SuccessResponse('Registration successful', {
          user: result.user,
          tokens: result.tokens,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: LoginDto = req.body;
      const result = await this.authService.login(req.tenantId, dto);

      res.json(
        SuccessResponse('Login successful', {
          user: result.user,
          tokens: result.tokens,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: RefreshTokenDto = req.body;
      const tokens = await this.authService.refreshToken(dto.refreshToken);

      res.json(SuccessResponse('Token refreshed', { tokens }));
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ForgotPasswordDto = req.body;
      await this.authService.forgotPassword(req.tenantId, dto.email);

      // Always return success to prevent email enumeration
      res.json(
        SuccessResponse(
          'If an account exists with that email, a password reset link has been sent'
        )
      );
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ResetPasswordDto = req.body;
      await this.authService.resetPassword(dto);

      res.json(SuccessResponse('Password reset successful'));
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ChangePasswordDto = req.body;
      await this.authService.changePassword(req.userId!, dto);

      res.json(SuccessResponse('Password changed successfully'));
    } catch (error) {
      next(error);
    }
  };

  getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await this.authService.getMe(req.userId!);

      res.json(SuccessResponse('User retrieved', { user }));
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    // With JWT, logout is handled client-side by removing the token
    // Optionally, you could blacklist the token in Redis
    res.json(SuccessResponse('Logout successful'));
  };
}
