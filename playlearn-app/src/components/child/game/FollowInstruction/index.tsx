'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getItem } from '@/lib/demo-data';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import Icon from '@/components/shared/Icon';
import { AudioButton, FeedbackBanner, GameStatus } from '../GameShared';
import type { GameComponentProps } from '../ListenPick';

const targets = [
  { id: 'window', className: 'scene-window', item: getItem('window') },
  { id: 'lamp', className: 'scene-lamp', item: getItem('lamp') },
  { id: 'sofa', className: 'scene-sofa', item: getItem('sofa') },
  { id: 'cat', className: 'scene-cat', item: getItem('cat') },
];

export function FollowInstructionGame({ levelId, sessionId, remainingSec }: GameComponentProps) {
  const { answerQuestion, activeSession } = usePlayLearnStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const target = getItem('cat');

  const choose = (id: string) => {
    if (status === 'correct') return;
    const correct = id === target.id;
    setSelected(id);
    setStatus(correct ? 'correct' : 'wrong');
    answerQuestion(correct, id);
  };

  return (
    <>
      <GameStatus levelId={levelId} gameType="follow_instruction" progress={0.8} lives={activeSession?.lives ?? 3} remainingSec={remainingSec} />

      <section className="instruction-card">
        <p>点击房间里的 <strong>{target.word}</strong></p>
        <AudioButton item={target} label="" compact />
      </section>

      <section className="scene-card card">
        <div className="scene" aria-label="房间场景">
          {targets.map(({ id, className, item }) => {
            const active = selected === id;
            return (
              <button key={id} type="button" className={`hotspot ${className}${active && status === 'correct' ? ' is-correct' : ''}${active && status === 'wrong' ? ' is-wrong' : ''}`} onClick={() => choose(id)} aria-label={item.word}>
                <span aria-hidden="true">{item.emoji}</span>
                <span>{item.word}</span>
              </button>
            );
          })}
        </div>
      </section>

      {status === 'correct' ? <FeedbackBanner kind="success"><Icon name="check" size={16} />找到了！</FeedbackBanner> : null}
      {status === 'wrong' ? <FeedbackBanner kind="error">听清楚指令，再找找看。</FeedbackBanner> : null}

      <section className="game-next">
        <Link href={status === 'correct' ? `/settlement?levelId=${encodeURIComponent(levelId)}&sessionId=${encodeURIComponent(sessionId ?? activeSession?.id ?? '')}` : '#'} aria-disabled={status !== 'correct'} className="button button-block" onClick={(event) => { if (status !== 'correct') event.preventDefault(); }} data-dom-id="cta-level-result">
          完成关卡
        </Link>
      </section>
    </>
  );
}

export default FollowInstructionGame;
