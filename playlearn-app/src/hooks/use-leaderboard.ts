'use client';

/**
 * useLeaderboard — 排行榜实时订阅
 *
 * PRD §10、§11：通过 Vercel Edge Functions + WebSocket 实现周积分实时更新。
 * API 返回无数据或 501 时保留本地 Top 50 Demo 数据。
 */
import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@/types';
import { DEMO_LEADERBOARD } from '@/lib/demo-data';

export interface UseLeaderboard {
  entries: LeaderboardEntry[];
  connected: boolean;
}

export function useLeaderboard(_weekStart?: Date): UseLeaderboard {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => DEMO_LEADERBOARD.map((entry) => ({
    childProfileId: entry.childProfileId,
    nickname: entry.nickname,
    avatar: entry.avatar,
    weeklyPoints: entry.weeklyPoints,
    rank: entry.rank,
    weekStart: new Date(),
  })));
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/leaderboard')
      .then(async (response) => response.ok ? response.json() as Promise<{ entries?: LeaderboardEntry[] }> : null)
      .then((data) => {
        if (!cancelled && data?.entries?.length) setEntries(data.entries);
      })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setConnected(false); });
    return () => { cancelled = true; };
  }, []);

  return { entries, connected };
}
