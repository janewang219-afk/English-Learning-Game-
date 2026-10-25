import { requireParent } from '@/server/auth';
import { settingsSchema } from '@/server/schemas';
import { notImplemented, parseJson, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async (request) => {
  requireParent(request);
  throw notImplemented('GET /api/settings');
});

export const PATCH = withRoute(async (request) => {
  requireParent(request);
  await parseJson(request, settingsSchema);
  throw notImplemented('PATCH /api/settings');
});
