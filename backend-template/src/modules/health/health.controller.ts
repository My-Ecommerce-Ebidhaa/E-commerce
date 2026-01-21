import { Request, Response } from 'express';
import { getKnex } from '@/database';
import { SuccessResponse } from '@/shared/utils/response.util';

export class HealthController {
  check = async (_req: Request, res: Response): Promise<void> => {
    res.json(SuccessResponse('OK', { status: 'healthy' }));
  };

  detailed = async (_req: Request, res: Response): Promise<void> => {
    const checks: Record<string, { status: string; latency?: number }> = {};

    // Database check
    try {
      const start = Date.now();
      await getKnex().raw('SELECT 1');
      checks.database = { status: 'healthy', latency: Date.now() - start };
    } catch {
      checks.database = { status: 'unhealthy' };
    }

    const allHealthy = Object.values(checks).every(
      (check) => check.status === 'healthy'
    );

    res.status(allHealthy ? 200 : 503).json(
      SuccessResponse(allHealthy ? 'All systems operational' : 'Some systems unhealthy', {
        status: allHealthy ? 'healthy' : 'unhealthy',
        checks,
        timestamp: new Date().toISOString(),
      })
    );
  };
}
