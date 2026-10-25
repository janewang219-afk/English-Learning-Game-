import type { LeaderboardEntry } from '@/types';

export type LeaderboardClientMessage = {
  type: 'subscribe' | 'unsubscribe';
  channel: string;
};

export interface LeaderboardUpdateMessage {
  type: 'leaderboard.update';
  weekStart: string;
  entries: Array<Pick<LeaderboardEntry, 'childProfileId' | 'nickname' | 'avatar' | 'weeklyPoints' | 'rank'>>;
}

export function leaderboardChannel(weekStart: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) throw new Error('invalid leaderboard weekStart');
  return `leaderboard:${weekStart}`;
}

export function parseLeaderboardClientMessage(raw: string): LeaderboardClientMessage | null {
  try {
    const value = JSON.parse(raw) as Partial<LeaderboardClientMessage>;
    if ((value.type !== 'subscribe' && value.type !== 'unsubscribe') || typeof value.channel !== 'string') return null;
    if (!/^leaderboard:\d{4}-\d{2}-\d{2}$/.test(value.channel)) return null;
    return { type: value.type, channel: value.channel };
  } catch {
    return null;
  }
}
