import { refreshSchema } from '@/server/schemas';
import { notImplemented, parseJson, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRoute(async (request) => {
  await parseJson(request, refreshSchema);
  throw notImplemented('POST /api/auth/logout');
});
