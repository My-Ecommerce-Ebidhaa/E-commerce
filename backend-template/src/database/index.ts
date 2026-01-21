import Knex from 'knex';
import { Model } from 'objection';
import { config } from '@/config';
import { logger } from '@/shared/logger';

let knexInstance: Knex.Knex | null = null;

export async function initializeDatabase(): Promise<Knex.Knex> {
  if (knexInstance) {
    return knexInstance;
  }

  knexInstance = Knex({
    client: 'pg',
    connection: config.database.url,
    pool: {
      min: config.database.pool.min,
      max: config.database.pool.max,
      afterCreate: (conn: unknown, done: (err: Error | null, conn: unknown) => void) => {
        done(null, conn);
      },
    },
  });

  // Bind Objection.js to Knex
  Model.knex(knexInstance);

  // Test connection
  try {
    await knexInstance.raw('SELECT 1');
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Failed to connect to database', error);
    throw error;
  }

  return knexInstance;
}

export function getKnex(): Knex.Knex {
  if (!knexInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return knexInstance;
}

export async function closeDatabase(): Promise<void> {
  if (knexInstance) {
    await knexInstance.destroy();
    knexInstance = null;
    logger.info('Database connection closed');
  }
}
