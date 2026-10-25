'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { GameType } from '@/types';
import { getItem, getLevel, type DemoLearningItem } from '@/lib/demo-data';
import Icon from '@/components/shared/Icon';

export function speakWord(item: DemoLearningItem | string) {
  if (typeof window === 'undefined') return;
  const text = typeof item === 'string' ? item : item.word;
  if ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  }
}

export function AudioButton({ item, label = '播放音频', compact = false }: { item: DemoLearningItem | string; label?: string; compact?: boolean }) {
  return (
    <button type="button" className={`button audio-button${compact ? ' button-small' : ''}`} onClick={() => speakWord(item)}>
      <Icon name="volume-2" size={compact ? 17 : 20} />
      <span>{label}</span>
    </button>
  );
}

export function GameStatus({ levelId, gameType, progress, lives, remainingSec }: { levelId: string; gameType: GameType; progress: number; lives: number; remainingSec?: number }) {
  const timerLabel = remainingSec == null ? null : `${Math.floor(remainingSec / 60)}:${String(remainingSec % 60).padStart(2, '0')}`;
  return (
    <section className="game-status" aria-label="游戏进度">
      <Link href="/theme-map" className="game-exit" data-dom-id="game-exit">
        <Icon name="x" size={20} />
        <span>退出</span>
      </Link>
      <div className="progress-track" aria-label={`已完成 ${Math.round(progress * 100)}%`}>
        <div className="progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className="game-lives" aria-label={`剩余 ${lives} 条生命`}>
        <Icon name="heart" size={20} filled />
        <span>{lives}</span>
      </div>
      {timerLabel ? <span className="game-timer" aria-label={`剩余时间 ${timerLabel}`}>{timerLabel}</span> : null}
      <span className="visually-hidden">{levelId} {gameType}</span>
    </section>
  );
}

export function getPrimaryItem(levelId: string, index = 0) {
  const level = getLevel(levelId);
  const itemId = level.learningItemIds[index % level.learningItemIds.length];
  return getItem(itemId);
}

export function getNextGameHref(levelId: string, gameType: GameType, sessionId?: string) {
  const level = getLevel(levelId);
  const currentIndex = level.gameTypes.indexOf(gameType);
  const nextType = currentIndex >= 0 ? level.gameTypes[currentIndex + 1] : undefined;
  const query = new URLSearchParams({ levelId });
  if (sessionId) query.set('sessionId', sessionId);
  if (nextType) return `/game/${nextType}?${query.toString()}`;
  return `/settlement?${query.toString()}`;
}

export function FeedbackBanner({ kind, children }: { kind: 'success' | 'error'; children: ReactNode }) {
  return <div className={`feedback-banner ${kind}`} role="status">{children}</div>;
}
