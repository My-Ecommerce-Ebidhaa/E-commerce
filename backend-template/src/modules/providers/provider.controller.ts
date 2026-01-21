import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { ProviderService } from './provider.service';
import { SuccessResponse } from '@/shared/utils/response.util';
import {
  ConfigurePaymentProviderDto,
  UpdatePaymentProviderDto,
  ConfigureEmailProviderDto,
  UpdateEmailProviderDto,
  ConfigureSmsProviderDto,
  UpdateSmsProviderDto,
} from './dto/provider.dto';
import { ProviderType } from '@/shared/providers/provider.factory';

@injectable()
export class ProviderController {
  constructor(
    @inject('ProviderService')
    private providerService: ProviderService
  ) {}

  // ==================== SUPPORTED PROVIDERS ====================

  getSupportedProviders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { type } = req.query as { type?: ProviderType };
      const providers = this.providerService.getSupportedProviders(type);

      res.json(SuccessResponse('Supported providers retrieved', { providers }));
    } catch (error) {
      next(error);
    }
  };

  // ==================== PAYMENT PROVIDERS ====================

  getPaymentProviders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const providers = await this.providerService.getPaymentProviders(
        req.tenantId
      );

      // Remove sensitive credentials from response
      const sanitized = providers.map((p) => ({
        ...p,
        credentials: '[ENCRYPTED]',
      }));

      res.json(SuccessResponse('Payment providers retrieved', { providers: sanitized }));
    } catch (error) {
      next(error);
    }
  };

  getPaymentProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const provider = await this.providerService.getPaymentProvider(
        req.tenantId,
        id
      );

      res.json(
        SuccessResponse('Payment provider retrieved', {
          provider: { ...provider, credentials: '[ENCRYPTED]' },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  configurePaymentProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ConfigurePaymentProviderDto = req.body;
      const provider = await this.providerService.configurePaymentProvider(
        req.tenantId,
        dto
      );

      res.status(201).json(
        SuccessResponse('Payment provider configured', {
          provider: { ...provider, credentials: '[ENCRYPTED]' },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updatePaymentProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: UpdatePaymentProviderDto = req.body;
      const provider = await this.providerService.updatePaymentProvider(
        req.tenantId,
        id,
        dto
      );

      res.json(
        SuccessResponse('Payment provider updated', {
          provider: { ...provider, credentials: '[ENCRYPTED]' },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  deletePaymentProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.providerService.deletePaymentProvider(req.tenantId, id);

      res.json(SuccessResponse('Payment provider deleted'));
    } catch (error) {
      next(error);
    }
  };

  // ==================== EMAIL PROVIDERS ====================

  getEmailProviders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const providers = await this.providerService.getEmailProviders(
        req.tenantId
      );

      const sanitized = providers.map((p) => ({
        ...p,
        credentials: '[ENCRYPTED]',
      }));

      res.json(SuccessResponse('Email providers retrieved', { providers: sanitized }));
    } catch (error) {
      next(error);
    }
  };

  getEmailProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const provider = await this.providerService.getEmailProvider(
        req.tenantId,
        id
      );

      res.json(
        SuccessResponse('Email provider retrieved', {
          provider: { ...provider, credentials: '[ENCRYPTED]' },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  configureEmailProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ConfigureEmailProviderDto = req.body;
      const provider = await this.providerService.configureEmailProvider(
        req.tenantId,
        dto
      );

      res.status(201).json(
        SuccessResponse('Email provider configured', {
          provider: { ...provider, credentials: '[ENCRYPTED]' },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateEmailProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: UpdateEmailProviderDto = req.body;
      const provider = await this.providerService.updateEmailProvider(
        req.tenantId,
        id,
        dto
      );

      res.json(
        SuccessResponse('Email provider updated', {
          provider: { ...provider, credentials: '[ENCRYPTED]' },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  deleteEmailProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.providerService.deleteEmailProvider(req.tenantId, id);

      res.json(SuccessResponse('Email provider deleted'));
    } catch (error) {
      next(error);
    }
  };

  // ==================== SMS PROVIDERS ====================

  getSmsProviders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const providers = await this.providerService.getSmsProviders(
        req.tenantId
      );

      const sanitized = providers.map((p) => ({
        ...p,
        credentials: '[ENCRYPTED]',
      }));

      res.json(SuccessResponse('SMS providers retrieved', { providers: sanitized }));
    } catch (error) {
      next(error);
    }
  };

  getSmsProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const provider = await this.providerService.getSmsProvider(
        req.tenantId,
        id
      );

      res.json(
        SuccessResponse('SMS provider retrieved', {
          provider: { ...provider, credentials: '[ENCRYPTED]' },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  configureSmsProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ConfigureSmsProviderDto = req.body;
      const provider = await this.providerService.configureSmsProvider(
        req.tenantId,
        dto
      );

      res.status(201).json(
        SuccessResponse('SMS provider configured', {
          provider: { ...provider, credentials: '[ENCRYPTED]' },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateSmsProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: UpdateSmsProviderDto = req.body;
      const provider = await this.providerService.updateSmsProvider(
        req.tenantId,
        id,
        dto
      );

      res.json(
        SuccessResponse('SMS provider updated', {
          provider: { ...provider, credentials: '[ENCRYPTED]' },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  deleteSmsProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.providerService.deleteSmsProvider(req.tenantId, id);

      res.json(SuccessResponse('SMS provider deleted'));
    } catch (error) {
      next(error);
    }
  };
}
