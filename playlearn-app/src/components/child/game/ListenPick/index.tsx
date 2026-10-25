'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getItem } from '@/lib/demo-data';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import { AudioButton, FeedbackBanner, GameStatus, getNextGameHref } from '../GameShared';

export interface GameComponentProps {
  levelId: string;
  sessionId?: string;
  remainingSec?: number;
}

export function ListenPickGame({ levelId, sessionId, remainingSec }: GameComponentProps) {
  const { answerQuestion, activeSession } = usePlayLearnStore();
  const target = getItem('cat');
  const options = useMemo(() => ['cat', 'dog', 'rabbit', 'bird'].map(getItem), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const choose = (itemId: string) => {
    if (status === 'correct') return;
    const correct = itemId === target.id;
    setSelectedId(itemId);
    setStatus(correct ? 'correct' : 'wrong');
    answerQuestion(correct, itemId);
  };

  const nextHref = getNextGameHref(levelId, 'listen_pick', sessionId ?? activeSession?.id);

  return (
    <>
      <GameStatus levelId={levelId} gameType="listen_pick" progress={0.15} lives={activeSession?.lives ?? 3} remainingSec={remainingSec} />

      <section className="game-prompt">
        <p className="eyebrow">听一听，选选看</p>
        <AudioButton item={target} label="播放音频" />
      </section>

      <section className="game-options" aria-label="动物选项">
        {options.map((item) => {
          const selected = selectedId === item.id;
          const resultClass = selected && status === 'correct' ? ' is-correct' : selected && status === 'wrong' ? ' is-wrong' : '';
          return (
            <button
              key={item.id}
              type="button"
              className={`option-card${selected ? ' is-selected' : ''}${resultClass}`}
              onClick={() => choose(item.id)}
              aria-pressed={selected}
            >
              <span className="option-emoji" aria-hidden="true">{item.emoji}</span>
              <span className="option-word">{item.word}</span>
            </button>
          );
        })}
      </section>

      {status === 'correct' ? <FeedbackBanner kind="success">太棒了！答对了 🎉</FeedbackBanner> : null}
      {status === 'wrong' ? <FeedbackBanner kind="error">再听一次，试试看！</FeedbackBanner> : null}

      <section className="game-next">
        <Link href={status === 'correct' ? nextHref : '#'} aria-disabled={status !== 'correct'} className="button button-block" onClick={(event) => { if (status !== 'correct') event.preventDefault(); }} data-dom-id="cta-game-drag-spell">
          下一题
        </Link>
      </section>
    </>
  );
}

export default ListenPickGame;
