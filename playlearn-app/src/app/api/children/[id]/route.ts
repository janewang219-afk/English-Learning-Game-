import { requireParent } from '@/server/auth';
import { childPatchSchema } from '@/server/schemas';
import { notImplemented, parseJson, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async (request, { params }) => {
  requireParent(request);
  if (!params?.id) throw notImplemented('GET /api/children/[id]');
  throw notImplemented('GET /api/children/[id]');
});

export const PATCH = withRoute(async (request, { params }) => {
  requireParent(request);
  if (!params?.id) throw notImplemented('PATCH /api/children/[id]');
  await parseJson(request, childPatchSchema);
  throw notImplemented('PATCH /api/children/[id]');
});
