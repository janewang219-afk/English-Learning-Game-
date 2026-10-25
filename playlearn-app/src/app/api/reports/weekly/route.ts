import { requireParent } from '@/server/auth';
import { weeklyReportQuerySchema } from '@/server/schemas';
import { notImplemented, parseQuery, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRoute(async (request) => {
  requireParent(request);
  parseQuery(request, weeklyReportQuerySchema);
  throw notImplemented('GET /api/reports/weekly');
});
