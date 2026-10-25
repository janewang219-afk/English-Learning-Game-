import { requireParentOrChild } from '@/server/auth';
import { childQuerySchema, sessionCreateSchema } from '@/server/schemas';
import { notImplemented, parseJson, parseQuery, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRoute(async (request) => {
  requireParentOrChild(request);
  await parseJson(request, sessionCreateSchema);
  throw notImplemented('POST /api/sessions');
});

export const GET = withRoute(async (request) => {
  requireParentOrChild(request);
  parseQuery(request, childQuerySchema);
  throw notImplemented('GET /api/sessions');
});
