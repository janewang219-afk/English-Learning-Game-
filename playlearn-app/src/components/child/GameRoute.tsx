'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { GameType } from '@/types';
import { DEMO_LEVELS } from '@/lib/demo-data';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import { ChildScreen } from '@/components/shared/AppShell';
import Icon from '@/components/shared/Icon';
import GameDispatcher from './game';

const gameTypes: GameType[] = ['listen_pick', 'drag_spell', 'read_aloud', 'follow_instruction'];

export function isGameType(value: string): value is GameType {
  return gameTypes.includes(value as GameType);
}

export default function GameRoute({ gameType, levelId, sessionId }: { gameType: GameType; levelId: string; sessionId?: string }) {
  const { activeSession, currentProfile, settings, startSession, lockSession } = usePlayLearnStore();
  const level = DEMO_LEVELS.find((entry) => entry.id === levelId);
  const fallbackLevel = DEMO_LEVELS[2];
  const currentLevel = DEMO_LEVELS.find((entry) => entry.id === currentProfile.currentLevelId);
  const isUnlocked = Boolean(level && currentLevel && level.themeId === 'animals' && level.order <= currentLevel.order);
  const resolvedLevel = level ?? fallbackLevel;
  const [remainingSec, setRemainingSec] = useState(settings.sessionTimeLimitMin * 60);

  useEffect(() => {
    if (!level || !isUnlocked) return;
    if (!activeSession || activeSession.levelId !== level.id || (activeSession.status !== 'active' && activeSession.status !== 'time_locked')) {
      startSession(level.id);
    }
  }, [activeSession, isUnlocked, level, startSession]);

  useEffect(() => {
    if (!level || !isUnlocked || !activeSession || activeSession.levelId !== level.id || activeSession.status !== 'active') return;
    const deadline = new Date(activeSession.startedAt).getTime() + settings.sessionTimeLimitMin * 60 * 1000;
    const update = () => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSec(next);
      if (next === 0) lockSession();
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [activeSession, isUnlocked, level, lockSession, settings.sessionTimeLimitMin]);

  if (!level || !isUnlocked) {
    return (
      <ChildScreen navigation={false} className="game-screen">
        <section className="card time-lock-card" role="alert">
          <Icon name={level ? 'lock' : 'info'} size={40} className="muted" />
          <h1>{level ? '这个关卡还没解锁' : '找不到这个关卡'}</h1>
          <p>{level ? '先完成前面的学习任务，就能继续探索啦！' : '返回学习地图，选择一个学习关卡吧。'}</p>
          <Link href="/theme-map" className="button button-block" style={{ marginTop: 22 }}>返回学习地图</Link>
        </section>
      </ChildScreen>
    );
  }

  if (activeSession?.levelId === resolvedLevel.id && activeSession.status === 'time_locked') {
    return (
      <ChildScreen navigation={false} className="game-screen">
        <section className="card time-lock-card" role="alert">
          <Icon name="clock" size={40} className="muted" />
          <h1>今天的学习时间到啦</h1>
          <p>休息一下，明天再来继续冒险吧！学习进度已经安全保存。</p>
          <Link href="/theme-map" className="button button-block" style={{ marginTop: 22 }}>返回学习地图</Link>
        </section>
      </ChildScreen>
    );
  }

  return (
    <ChildScreen navigation={false} className="game-screen">
      <GameDispatcher gameType={gameType} levelId={resolvedLevel.id} sessionId={sessionId ?? activeSession?.id} remainingSec={remainingSec} />
    </ChildScreen>
  );
}
