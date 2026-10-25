import { notImplemented, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async (_request, { params }) => {
  throw notImplemented(`GET /api/content/levels/${params?.levelId || '[levelId]'}`);
});
