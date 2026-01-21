import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { PlatformSettingsService } from './platform-settings.service';
import { SuccessResponse } from '@/shared/utils/response.util';
import { ProviderType } from '@/repositories/platformSettings.repo';
import {
  ConfigureDefaultProviderDto,
  UpdatePlatformSettingsDto,
} from './dto/platform-settings.dto';

@injectable()
export class PlatformSettingsController {
  constructor(
    @inject('PlatformSettingsService')
    private settingsService: PlatformSettingsService
  ) {}

  /**
   * Get platform settings
   * GET /api/v1/platform/settings
   */
  getSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const settings = await this.settingsService.getSanitizedSettings();
      res.json(SuccessResponse('Platform settings retrieved', { settings }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update general platform settings
   * PATCH /api/v1/platform/settings
   */
  updateSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: UpdatePlatformSettingsDto = req.body;
      await this.settingsService.updateSettings(dto);
      const settings = await this.settingsService.getSanitizedSettings();
      res.json(SuccessResponse('Platform settings updated', { settings }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get supported providers
   * GET /api/v1/platform/settings/providers/supported
   */
  getSupportedProviders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { type } = req.query as { type?: ProviderType };
      const providers = this.settingsService.getSupportedProviders(type);
      res.json(SuccessResponse('Supported providers retrieved', { providers }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Configure default payment provider
   * POST /api/v1/platform/settings/providers/payment
   */
  configureDefaultPaymentProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ConfigureDefaultProviderDto = req.body;
      await this.settingsService.configureDefaultPaymentProvider(dto);
      const settings = await this.settingsService.getSanitizedSettings();
      res.status(201).json(
        SuccessResponse('Default payment provider configured', { settings })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Configure default email provider
   * POST /api/v1/platform/settings/providers/email
   */
  configureDefaultEmailProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ConfigureDefaultProviderDto = req.body;
      await this.settingsService.configureDefaultEmailProvider(dto);
      const settings = await this.settingsService.getSanitizedSettings();
      res.status(201).json(
        SuccessResponse('Default email provider configured', { settings })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Configure default SMS provider
   * POST /api/v1/platform/settings/providers/sms
   */
  configureDefaultSmsProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ConfigureDefaultProviderDto = req.body;
      await this.settingsService.configureDefaultSmsProvider(dto);
      const settings = await this.settingsService.getSanitizedSettings();
      res.status(201).json(
        SuccessResponse('Default SMS provider configured', { settings })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove default provider
   * DELETE /api/v1/platform/settings/providers/:type
   */
  removeDefaultProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { type } = req.params as { type: ProviderType };
      await this.settingsService.removeDefaultProvider(type);
      res.json(SuccessResponse(`Default ${type} provider removed`));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if default provider is configured
   * GET /api/v1/platform/settings/providers/:type/status
   */
  getProviderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { type } = req.params as { type: ProviderType };
      const hasProvider = await this.settingsService.hasDefaultProvider(type);
      res.json(
        SuccessResponse('Provider status retrieved', {
          type,
          configured: hasProvider,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
