import { requireParent } from '@/server/auth';
import { feedbackSchema } from '@/server/schemas';
import { notImplemented, parseJson, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRoute(async (request) => {
  requireParent(request);
  await parseJson(request, feedbackSchema);
  throw notImplemented('POST /api/feedback');
});
