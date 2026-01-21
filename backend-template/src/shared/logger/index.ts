import pino from 'pino';
import { config } from '@/config';

export const logger = pino({
  level: config.app.isDevelopment ? 'debug' : 'info',
  transport: config.app.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: config.app.env,
    app: config.app.name,
  },
});

export type Logger = typeof logger;
