import { ensureRedisConnection, redis } from '@/lib/redis';
import type { LeaderboardPublisher, LeaderboardSubscriber, SessionCache } from '@/server/ports';

export class RedisSessionCache implements SessionCache {
  async get<T>(key: string): Promise<T | null> {
    await ensureRedisConnection();
    const value = await redis.get(key);
    return value ? JSON.parse(value) as T : null;
  }

  async set<T>(key: string, value: T, ttlSec: number): Promise<void> {
    await ensureRedisConnection();
    await redis.set(key, JSON.stringify(value), 'EX', Math.max(1, ttlSec));
  }

  async delete(key: string): Promise<void> {
    await ensureRedisConnection();
    await redis.del(key);
  }
}

export class RedisLeaderboardPublisher implements LeaderboardPublisher {
  async publish(channel: string, payload: unknown): Promise<void> {
    await ensureRedisConnection();
    await redis.publish(channel, JSON.stringify(payload));
  }
}

export class RedisLeaderboardSubscriber implements LeaderboardSubscriber {
  async subscribe(channel: string, onMessage: (payload: string) => void): Promise<() => Promise<void>> {
    const subscriber = redis.duplicate();
    subscriber.on('error', () => undefined);
    await subscriber.connect();
    await subscriber.subscribe(channel);
    subscriber.on('message', (receivedChannel, payload) => {
      if (receivedChannel === channel) onMessage(payload);
    });
    return async () => {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
    };
  }
}

export const redisSessionCache = new RedisSessionCache();
export const redisLeaderboardPublisher = new RedisLeaderboardPublisher();
export const redisLeaderboardSubscriber = new RedisLeaderboardSubscriber();
