import test from 'node:test';
import assert from 'node:assert/strict';

import {
  childCreateSchema,
  registerSchema,
  sessionSyncSchema,
} from '@/server/schemas';
import {
  badRequest,
  jsonError,
  notImplemented,
} from '@/server/http';
import {
  extractBearerToken,
  signAccessToken,
  signChildAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/auth';
import { MockSpeechProvider } from '@/lib/speech/server';
import { leaderboardChannel, parseLeaderboardClientMessage } from '@/lib/websocket/protocol';
import { weekStartKey } from '@/server/time';

test('request schemas accept valid parent and child payloads', () => {
  assert.equal(registerSchema.safeParse({ email: 'parent@example.com', password: 'playlearn', displayName: '家长' }).success, true);
  assert.equal(childCreateSchema.safeParse({ nickname: '小星星', age: 8, avatar: 'star' }).success, true);
  assert.equal(childCreateSchema.safeParse({ nickname: '过小', age: 6, avatar: 'star' }).success, false);
});

test('offline session sync requires an idempotency key and validates mastery bounds', () => {
  const valid = sessionSyncSchema.safeParse({
    clientSyncId: 'sync-1',
    status: 'completed',
    masteryUpdates: [{
      learningItemId: 'cat',
      masteryScore: 85,
      reviewCount: 2,
      correctCount: 2,
      nextReviewDue: '2026-10-05T00:00:00.000Z',
      inReviewQueue: false,
    }],
  });
  assert.equal(valid.success, true);
  assert.equal(sessionSyncSchema.safeParse({ clientSyncId: 'sync-1', masteryUpdates: [{ masteryScore: 120 }] }).success, false);
});

test('JWT helpers preserve roles and token types', () => {
  const parentAccess = signAccessToken({ sub: 'parent-1', role: 'parent' });
  const parentRefresh = signRefreshToken({ sub: 'parent-1', role: 'parent' });
  const childAccess = signChildAccessToken('child-1', 'parent-1');

  assert.equal(verifyAccessToken(parentAccess).type, 'access');
  assert.equal(verifyAccessToken(parentAccess).role, 'parent');
  assert.equal(verifyRefreshToken(parentRefresh).type, 'refresh');
  assert.equal(verifyAccessToken(childAccess).role, 'child');
  assert.equal(extractBearerToken(`Bearer ${parentAccess}`), parentAccess);
});

test('API error envelope is stable', async () => {
  const request = new Request('http://localhost/api/example', { headers: { 'x-request-id': 'req-test' } });
  const response = jsonError(request, badRequest('invalid'));
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('x-request-id'), 'req-test');
  assert.deepEqual(await response.json(), {
    error: { code: 'BAD_REQUEST', message: 'invalid' },
    requestId: 'req-test',
  });
  assert.equal(notImplemented('/api/example').status, 501);
});

test('speech mock is deterministic and protocol validates leaderboard messages', async () => {
  const assessment = await new MockSpeechProvider().assess({ audio: new Blob(['audio']) });
  assert.deepEqual(assessment, { overall: 80, phonemes: [], pass: true, degraded: false, mode: 'scored' });
  assert.equal(leaderboardChannel('2026-10-05'), 'leaderboard:2026-10-05');
  assert.deepEqual(parseLeaderboardClientMessage('{"type":"subscribe","channel":"leaderboard:2026-10-05"}'), {
    type: 'subscribe',
    channel: 'leaderboard:2026-10-05',
  });
  assert.equal(parseLeaderboardClientMessage('{"type":"subscribe","channel":"private"}'), null);
});

test('weekly keys use Monday in the configured business timezone', () => {
  assert.equal(weekStartKey(new Date('2026-10-05T00:30:00.000Z'), 'Asia/Shanghai'), '2026-10-05');
  assert.equal(weekStartKey(new Date('2026-10-11T15:30:00.000Z'), 'Asia/Shanghai'), '2026-10-05');
});
