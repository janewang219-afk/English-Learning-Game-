import { childQuerySchema, badgeAwardSchema } from '@/server/schemas';
import { notImplemented, parseJson, parseQuery, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async (request) => {
  parseQuery(request, childQuerySchema);
  throw notImplemented('GET /api/badges');
});

export const POST = withRoute(async (request) => {
  await parseJson(request, badgeAwardSchema);
  throw notImplemented('POST /api/badges');
});
