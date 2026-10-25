import { requireParentOrChild } from '@/server/auth';
import { sessionSyncSchema } from '@/server/schemas';
import { badRequest, notImplemented, parseJson, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async (request, { params }) => {
  requireParentOrChild(request);
  throw notImplemented(`GET /api/sessions/${params?.id || '[id]'}`);
});

export const PATCH = withRoute(async (request, { params }) => {
  requireParentOrChild(request);
  const body = await parseJson(request, sessionSyncSchema);
  const idempotencyKey = request.headers.get('idempotency-key');
  if (idempotencyKey && idempotencyKey !== body.clientSyncId) {
    throw badRequest('Idempotency-Key 必须与 clientSyncId 一致');
  }
  throw notImplemented(`PATCH /api/sessions/${params?.id || '[id]'}`);
});
