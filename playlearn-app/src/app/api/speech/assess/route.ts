import { requireChild } from '@/server/auth';
import { speechQuerySchema } from '@/server/schemas';
import { badRequest, notImplemented, parseQuery, withRoute } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRoute(async (request) => {
  requireChild(request);
  const form = await request.formData().catch(() => null);
  if (!form) throw badRequest('需要 multipart/form-data 请求');
  const audio = form.get('audioBlob');
  if (!(audio instanceof Blob)) throw badRequest('缺少 audioBlob 音频文件');

  const query = new URL(request.url);
  const learningItemId = form.get('learningItemId');
  const referenceText = form.get('referenceText');
  if (typeof learningItemId === 'string' && learningItemId) query.searchParams.set('learningItemId', learningItemId);
  if (typeof referenceText === 'string' && referenceText) query.searchParams.set('referenceText', referenceText);
  parseQuery(new Request(query), speechQuerySchema);
  throw notImplemented('POST /api/speech/assess');
});
