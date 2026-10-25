import { requireParent } from '@/server/auth';
import { childCreateSchema, childQuerySchema } from '@/server/schemas';
import { notImplemented, parseJson, parseQuery, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async (request) => {
  requireParent(request);
  parseQuery(request, childQuerySchema);
  throw notImplemented('GET /api/children');
});

export const POST = withRoute(async (request) => {
  requireParent(request);
  await parseJson(request, childCreateSchema);
  throw notImplemented('POST /api/children');
});
