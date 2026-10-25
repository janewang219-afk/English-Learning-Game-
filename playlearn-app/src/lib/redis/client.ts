/**
 * Redis 客户端单例
 *
 * PRD §11 数据库：Redis 用于两类场景
 *   1. 会话状态缓存（当前活跃 GameSession、计时器校验）
 *   2. 排行榜实时排名（Sorted Set 结构，按周积分排序）
 *
 * 部署到 Vercel 时使用外部 Redis 服务（如 Upstash / Redis Cloud）。
 */

import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var __playlearnRedis: Redis | undefined;
}

export const redis: Redis =
  globalThis.__playlearnRedis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 10_000,
  });

redis.on('error', () => {
  // 健康检查和调用方负责暴露连接失败，不让 ioredis 产生未处理异常。
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__playlearnRedis = redis;
}

/** 排行榜 Sorted Set key 前缀，按周分区 */
export function leaderboardKey(weekStart: Date): string {
  const iso = weekStart.toISOString().slice(0, 10); // YYYY-MM-DD
  return `leaderboard:${iso}`;
}

/** GameSession 状态缓存 key */
export function sessionKey(sessionId: string): string {
  return `session:${sessionId}`;
}

/** Refresh token 黑名单 key */
export function revokedTokenKey(jti: string): string {
  return `revoked:${jti}`;
}

export async function ensureRedisConnection(): Promise<void> {
  if (redis.status === 'wait') await redis.connect();
}

export async function pingRedis(): Promise<string> {
  await ensureRedisConnection();
  return redis.ping();
}
