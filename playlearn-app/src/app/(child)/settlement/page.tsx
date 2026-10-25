'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getLevel } from '@/lib/demo-data';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import { ChildScreen } from '@/components/shared/AppShell';
import Icon from '@/components/shared/Icon';
import type { LevelResult } from '@/types';

export default function SettlementPage() {
  const { activeSession, lastResult, completeLevel } = usePlayLearnStore();
  const searchParams = useSearchParams();
  const didComplete = useRef(false);
  const requestedLevelId = searchParams.get('levelId');
  const levelId = activeSession?.levelId ?? requestedLevelId ?? 'animals-3';
  const level = getLevel(levelId);
  const itemCount = level.learningItemIds.length;

  const generatedResult = useMemo<LevelResult>(() => {
    const attempted = activeSession?.itemsAnswered ?? 0;
    const answered = Math.max(itemCount, attempted, 1);
    const correct = Math.min(answered, (activeSession?.itemsCorrect ?? 0) + Math.max(0, itemCount - attempted));
    const wrong = activeSession?.wrongCount ?? Math.max(0, answered - correct);
    const accuracy = correct / answered;
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : 1;
    return {
      levelId: level.id,
      sessionId: activeSession?.id ?? searchParams.get('sessionId') ?? undefined,
      itemsAnswered: answered,
      itemsCorrect: correct,
      wrongCount: wrong,
      stars,
      pointsEarned: stars === 3 ? 120 : stars === 2 ? 80 : 50,
      badgesEarned: stars === 3 ? ['winner'] : [],
      accuracy,
    };
  }, [activeSession, itemCount, level.id, searchParams]);

  const result = lastResult?.levelId === level.id ? lastResult : generatedResult;

  useEffect(() => {
    if (lastResult?.levelId !== level.id && !didComplete.current) {
      didComplete.current = true;
      completeLevel(generatedResult);
    }
  }, [completeLevel, generatedResult, lastResult, level.id]);

  return (
    <ChildScreen>
      <section className="card result-card">
        <div className="result-stars" aria-label={`${result.stars} 颗星`}>
          {[0, 1, 2].map((index) => <Icon key={index} name="star" size={index === 1 ? 48 : 40} filled className={index < result.stars ? 'star-bounce' : ''} style={{ opacity: index < result.stars ? 1 : 0.22 }} />)}
        </div>
        <h1>关卡完成！</h1>
        <p className="result-points">+{result.pointsEarned} 积分</p>
        <p>本次准确率 {Math.round(result.accuracy * 100)}%</p>
      </section>

      <section className="page-section stat-grid">
        <div className="card stat-card"><p className="stat-value">{result.itemsAnswered}</p><p className="stat-label">学习单词</p></div>
        <div className="card stat-card"><p className="stat-value success">{result.wrongCount}</p><p className="stat-label">错误次数</p></div>
        <div className="card stat-card"><p className="stat-value primary">{result.badgesEarned.length || 1}</p><p className="stat-label">获得徽章</p></div>
      </section>

      <section className="page-section weak-alert" style={{ color: 'var(--play-success)', background: 'var(--play-success-bg)' }}>
        <Icon name="lightbulb" size={20} />
        <div><strong>弱项提示</strong><p>发音很棒，继续加油！</p></div>
      </section>

      <section className="result-actions">
        <Link href={`/level/${encodeURIComponent(level.order < 5 ? `animals-${level.order + 1}` : level.id)}`} className="button button-block" data-dom-id="cta-level-view">下一关</Link>
        <Link href="/theme-map" className="button button-secondary button-block" data-dom-id="cta-theme-map">返回地图</Link>
      </section>
    </ChildScreen>
  );
}
