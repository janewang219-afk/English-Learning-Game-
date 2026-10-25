import { requireParent } from '@/server/auth';
import { notImplemented, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRoute(async (request, { params }) => {
  requireParent(request);
  if (!params?.id) throw notImplemented('POST /api/children/[id]/activate');
  throw notImplemented('POST /api/children/[id]/activate');
});
