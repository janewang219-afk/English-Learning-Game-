'use client';

/**
 * useOfflineSync — 离线数据自动同步
 *
 * PRD §10 离线容错：网络恢复后自动批量同步至服务端。
 * API 同步失败时保留 IndexedDB 队列，网络恢复后自动重试。
 */
import { useCallback, useEffect, useState } from 'react';
import { listPendingSyncs, removePendingSync } from '@/lib/offline';

export interface UseOfflineSync {
  isOnline: boolean;
  pendingCount: number;
  flush: () => Promise<void>;
}

export function useOfflineSync(): UseOfflineSync {
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const pending = await listPendingSyncs();
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  const flush = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    try {
      const pending = await listPendingSyncs();
      await Promise.all(pending.map(async ({ id, session, masteryUpdates }) => {
        try {
          const response = await fetch(`/api/sessions/${session.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': id },
            body: JSON.stringify({
              clientSyncId: id,
              status: session.status,
              durationSec: session.durationSec,
              levelsCompleted: session.levelsCompleted,
              itemsAnswered: session.itemsAnswered,
              itemsCorrect: session.itemsCorrect,
              pointsEarned: session.pointsEarned,
              masteryUpdates,
            }),
          });
          if (response.ok) await removePendingSync(id);
        } catch {
          // Keep the record queued until a later online event succeeds.
        }
      }));
      await refresh();
    } catch {
      // IndexedDB may be unavailable; the next online event will retry.
    }
  }, [refresh]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateOnline = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) void flush();
      else void refresh();
    };
    void refresh();
    void flush();
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, [flush, refresh]);

  return { isOnline, pendingCount, flush };
}
