import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { TenantRepository } from '@/repositories/tenant.repo';
import { NotFoundError } from '@/shared/errors/app.error';
import { Tenant } from '@/models/Tenant.model';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      tenant: Tenant;
      tenantId: string;
    }
  }
}

export async function tenantMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Try to get tenant from header (set by edge/proxy)
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    const tenantDomain = req.headers['x-tenant-domain'] as string;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantSlug && !tenantDomain && !tenantId) {
      throw new NotFoundError('Tenant not specified', 'TENANT_NOT_SPECIFIED');
    }

    const tenantRepo = container.resolve(TenantRepository);
    let tenant: Tenant | undefined;

    if (tenantId) {
      tenant = await tenantRepo.findById(tenantId);
    } else if (tenantSlug) {
      tenant = await tenantRepo.findBySlug(tenantSlug);
    } else if (tenantDomain) {
      tenant = await tenantRepo.findByDomain(tenantDomain);
    }

    if (!tenant) {
      throw new NotFoundError('Tenant not found', 'TENANT_NOT_FOUND');
    }

    if (tenant.status !== 'active') {
      throw new NotFoundError(
        'Tenant is not active',
        'TENANT_INACTIVE'
      );
    }

    req.tenant = tenant;
    req.tenantId = tenant.id;

    next();
  } catch (error) {
    next(error);
  }
}

// Optional tenant middleware (for routes that may or may not need tenant context)
export async function optionalTenantMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    const tenantDomain = req.headers['x-tenant-domain'] as string;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantSlug && !tenantDomain && !tenantId) {
      return next();
    }

    const tenantRepo = container.resolve(TenantRepository);
    let tenant: Tenant | undefined;

    if (tenantId) {
      tenant = await tenantRepo.findById(tenantId);
    } else if (tenantSlug) {
      tenant = await tenantRepo.findBySlug(tenantSlug);
    } else if (tenantDomain) {
      tenant = await tenantRepo.findByDomain(tenantDomain);
    }

    if (tenant && tenant.status === 'active') {
      req.tenant = tenant;
      req.tenantId = tenant.id;
    }

    next();
  } catch (error) {
    next(error);
  }
}
