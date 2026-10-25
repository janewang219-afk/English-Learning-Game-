'use client';

/**
 * useGameSession — 防沉迷计时与 GameSession 状态管理
 *
 * PRD §7 GameSession、§10 协作与同步、§14 零挫败容忍。
 * 提供 API 尝试 + 本地计时 fallback；页面层可用它实现超时锁定。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameSessionStatus } from '@/types';
import { APP_CONFIG } from '@/config';

export interface UseGameSession {
  status: GameSessionStatus | 'idle';
  elapsedSec: number;
  start: (childProfileId: string) => Promise<void>;
  lock: () => Promise<void>;
}

export function useGameSession(): UseGameSession {
  const [status, setStatus] = useState<GameSessionStatus | 'idle'>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const sessionIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async (childProfileId: string) => {
    try {
      const response = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ childProfileId }) });
      if (response.ok) {
        const data = await response.json() as { id?: string };
        sessionIdRef.current = data.id ?? null;
      }
    } catch {
      sessionIdRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsedSec(0);
    setStatus('active');
    timerRef.current = setInterval(() => {
      setElapsedSec((current) => {
        const next = current + 1;
        if (next >= APP_CONFIG.defaultSessionLimitMin * 60) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus('time_locked');
        }
        return next;
      });
    }, 1000);
  }, []);

  const lock = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('time_locked');
    if (sessionIdRef.current) {
      try { await fetch(`/api/sessions/${sessionIdRef.current}/lock`, { method: 'POST' }); } catch { /* offline fallback */ }
    }
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { status, elapsedSec, start, lock };
}
