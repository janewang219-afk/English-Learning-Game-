import { prisma } from '@/lib/db';
import { pingRedis } from '@/lib/redis';
import { getRequestId, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async (request) => {
  const checks = await Promise.all([
    (async () => {
      try {
        await prisma.$queryRawUnsafe('SELECT 1');
        return { status: 'up' as const };
      } catch (error) {
        return { status: 'down' as const, message: error instanceof Error ? error.message : 'database unavailable' };
      }
    })(),
    (async () => {
      try {
        await pingRedis();
        return { status: 'up' as const };
      } catch (error) {
        return { status: 'down' as const, message: error instanceof Error ? error.message : 'redis unavailable' };
      }
    })(),
  ]);

  const healthy = checks.every((check) => check.status === 'up');
  const requestId = getRequestId(request);
  return new Response(JSON.stringify({
    data: {
      status: healthy ? 'ok' : 'degraded',
      services: { postgres: checks[0], redis: checks[1] },
    },
    requestId,
  }), {
    status: healthy ? 200 : 503,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-request-id': requestId },
  });
});
