import { levelsQuerySchema } from '@/server/schemas';
import { notImplemented, parseQuery, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async (request) => {
  parseQuery(request, levelsQuerySchema);
  throw notImplemented('GET /api/content/levels');
});
