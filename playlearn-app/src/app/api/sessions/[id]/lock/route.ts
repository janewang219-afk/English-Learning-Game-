import { requireParentOrChild } from '@/server/auth';
import { notImplemented, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRoute(async (request, { params }) => {
  requireParentOrChild(request);
  throw notImplemented(`POST /api/sessions/${params?.id || '[id]'}/lock`);
});
