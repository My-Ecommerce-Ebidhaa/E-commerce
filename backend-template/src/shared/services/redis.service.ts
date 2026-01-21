import { injectable } from 'tsyringe';
import Redis from 'ioredis';
import { config } from '@/config';
import { logger } from '@/shared/logger';

@injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      logger.info('Redis connected');
    });

    this.client.on('error', (err) => {
      logger.error('Redis error:', err);
    });
  }

  getClient(): Redis {
    return this.client;
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  // Distributed locking
  async acquireLock(
    key: string,
    value: string,
    ttlSeconds: number
  ): Promise<boolean> {
    const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string, value: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, key, value);
    return result === 1;
  }

  async extendLock(
    key: string,
    value: string,
    ttlSeconds: number
  ): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("expire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, key, value, ttlSeconds);
    return result === 1;
  }

  // Counter operations
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async incrBy(key: string, amount: number): Promise<number> {
    return this.client.incrby(key, amount);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async decrBy(key: string, amount: number): Promise<number> {
    return this.client.decrby(key, amount);
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  // List operations
  async lpush(key: string, value: string): Promise<number> {
    return this.client.lpush(key, value);
  }

  async rpush(key: string, value: string): Promise<number> {
    return this.client.rpush(key, value);
  }

  async lpop(key: string): Promise<string | null> {
    return this.client.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return this.client.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }

  // Set operations
  async sadd(key: string, member: string): Promise<number> {
    return this.client.sadd(key, member);
  }

  async srem(key: string, member: string): Promise<number> {
    return this.client.srem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sismember(key, member);
    return result === 1;
  }

  // Key pattern operations
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async scan(pattern: string, count = 100): Promise<string[]> {
    const results: string[] = [];
    let cursor = '0';

    do {
      const [newCursor, keys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        count
      );
      cursor = newCursor;
      results.push(...keys);
    } while (cursor !== '0');

    return results;
  }

  // JSON helpers
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  // Cleanup
  async close(): Promise<void> {
    await this.client.quit();
  }
}

// Lock key patterns
export const LockKeys = {
  INVENTORY_UPDATE: (productId: string, variantId?: string) =>
    `lock:inventory:${productId}${variantId ? `:${variantId}` : ''}`,
  CART_UPDATE: (cartId: string) => `lock:cart:${cartId}`,
  ORDER_CREATE: (cartId: string) => `lock:order:create:${cartId}`,
  ORDER_UPDATE: (orderId: string) => `lock:order:update:${orderId}`,
  PAYMENT_PROCESS: (orderId: string) => `lock:payment:${orderId}`,
  DISCOUNT_REDEEM: (code: string) => `lock:discount:${code}`,
  USER_CART_MERGE: (userId: string) => `lock:cart:merge:${userId}`,
} as const;

export const LockTTL = {
  INVENTORY: 30,
  CART: 10,
  ORDER_CREATE: 60,
  ORDER_UPDATE: 30,
  PAYMENT: 120,
  DISCOUNT: 10,
  CART_MERGE: 30,
} as const;
