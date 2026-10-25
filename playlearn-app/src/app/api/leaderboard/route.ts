import { leaderboardQuerySchema } from '@/server/schemas';
import { notImplemented, parseQuery, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async (request) => {
  parseQuery(request, leaderboardQuerySchema);
  throw notImplemented('GET /api/leaderboard');
});
