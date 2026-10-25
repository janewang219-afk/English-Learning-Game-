import { notImplemented, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async () => {
  throw notImplemented('GET /api/content/themes');
});
