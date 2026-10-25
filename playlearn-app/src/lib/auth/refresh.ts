import { ensureRedisConnection, redis, revokedTokenKey } from '@/lib/redis';

export async function revokeRefreshToken(jti: string, ttlSec: number): Promise<void> {
  await ensureRedisConnection();
  await redis.set(revokedTokenKey(jti), '1', 'EX', Math.max(1, ttlSec));
}

export async function isRefreshTokenRevoked(jti: string): Promise<boolean> {
  await ensureRedisConnection();
  return (await redis.get(revokedTokenKey(jti))) === '1';
}
