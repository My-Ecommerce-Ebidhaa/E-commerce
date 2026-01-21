import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: Number(process.env.DATABASE_POOL_MIN) || 2,
      max: Number(process.env.DATABASE_POOL_MAX) || 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  },

  staging: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: Number(process.env.DATABASE_POOL_MIN) || 2,
      max: Number(process.env.DATABASE_POOL_MAX) || 20,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './dist/database/migrations',
    },
    seeds: {
      directory: './dist/database/seeds',
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: Number(process.env.DATABASE_POOL_MIN) || 2,
      max: Number(process.env.DATABASE_POOL_MAX) || 20,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './dist/database/migrations',
    },
    seeds: {
      directory: './dist/database/seeds',
    },
  },
};

export default config;
