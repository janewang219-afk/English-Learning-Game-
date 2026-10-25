'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getItem } from '@/lib/demo-data';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import { AudioButton, FeedbackBanner, GameStatus, getNextGameHref } from '../GameShared';
import type { GameComponentProps } from '../ListenPick';

const target = getItem('cat');
const letters = ['c', 'a', 't', 'o', 'g'];

export function DragSpellGame({ levelId, sessionId, remainingSec }: GameComponentProps) {
  const { answerQuestion, activeSession } = usePlayLearnStore();
  const [selected, setSelected] = useState<Array<number | null>>([null, null, null]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const placeLetter = (letterIndex: number, slotIndex?: number) => {
    if (status === 'correct' || selected.includes(letterIndex)) return;
    const nextSlot = slotIndex ?? selected.findIndex((value) => value === null);
    if (nextSlot < 0) return;
    const next = [...selected];
    next[nextSlot] = letterIndex;
    setSelected(next);
    if (next.every((value) => value !== null)) {
      const word = next.map((index) => letters[index as number]).join('');
      const correct = word === target.word;
      setStatus(correct ? 'correct' : 'wrong');
      answerQuestion(correct, target.id);
    }
  };

  const reset = () => {
    setSelected([null, null, null]);
    setStatus('idle');
  };

  const nextHref = getNextGameHref(levelId, 'drag_spell', sessionId ?? activeSession?.id);

  return (
    <>
      <GameStatus levelId={levelId} gameType="drag_spell" progress={0.3} lives={activeSession?.lives ?? 3} remainingSec={remainingSec} />

      <section className="game-prompt">
        <p className="eyebrow">听音，把字母拖到正确位置</p>
        <AudioButton item={target} label="播放音频" />
      </section>

      <section className="letter-targets" aria-label="拼写目标">
        {selected.map((letterIndex, slotIndex) => (
          <button
            type="button"
            key={slotIndex}
            className={`letter-slot${letterIndex !== null ? ' is-filled' : ''}`}
            onClick={() => {
              const next = [...selected];
              next[slotIndex] = null;
              setSelected(next);
              setStatus('idle');
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) placeLetter(dragIndex, slotIndex);
              setDragIndex(null);
            }}
            aria-label={letterIndex === null ? `第 ${slotIndex + 1} 个字母` : letters[letterIndex]}
          >
            {letterIndex === null ? '' : letters[letterIndex]}
          </button>
        ))}
      </section>

      <section className="letter-bank" aria-label="字母池">
        {letters.map((letter, index) => (
          <button
            type="button"
            draggable
            key={`${letter}-${index}`}
            className={`letter-tile${selected.includes(index) ? ' is-used' : ''}`}
            onClick={() => placeLetter(index)}
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => setDragIndex(null)}
            aria-label={`选择字母 ${letter}`}
          >
            {letter}
          </button>
        ))}
      </section>

      {status === 'correct' ? <FeedbackBanner kind="success">拼写正确！太棒了 🎉</FeedbackBanner> : null}
      {status === 'wrong' ? <FeedbackBanner kind="error">顺序不对，再试一次吧。</FeedbackBanner> : null}

      {status === 'wrong' ? <button type="button" className="button button-secondary button-block game-next" onClick={reset}>重新拼写</button> : null}
      <section className="game-next">
        <Link href={status === 'correct' ? nextHref : '#'} aria-disabled={status !== 'correct'} className="button button-block" onClick={(event) => { if (status !== 'correct') event.preventDefault(); }} data-dom-id="cta-game-read-aloud">
          下一题
        </Link>
      </section>
    </>
  );
}

export default DragSpellGame;
