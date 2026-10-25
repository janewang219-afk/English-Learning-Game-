'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { getItem } from '@/lib/demo-data';
import { useSpeechRecorder } from '@/hooks/use-speech-recorder';
import { usePlayLearnStore } from '@/components/shared/PlayLearnStore';
import Icon from '@/components/shared/Icon';
import { FeedbackBanner, GameStatus, getNextGameHref, speakWord } from '../GameShared';
import type { GameComponentProps } from '../ListenPick';

const target = getItem('cat');

export function ReadAloudGame({ levelId, sessionId, remainingSec }: GameComponentProps) {
  const { answerQuestion, activeSession } = usePlayLearnStore();
  const recorder = useSpeechRecorder();
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const isRecording = recorder.state === 'recording';
  const pressedRef = useRef(false);
  const stoppingRef = useRef(false);
  const startPromiseRef = useRef<Promise<void> | null>(null);

  const start = () => {
    if (pressedRef.current) return;
    pressedRef.current = true;
    setFeedback('idle');
    const pending = recorder.start();
    startPromiseRef.current = pending;
    void pending.finally(() => {
      startPromiseRef.current = null;
    });
  };

  const stop = async () => {
    pressedRef.current = false;
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    if (startPromiseRef.current) await startPromiseRef.current;
    const result = await recorder.stop();
    if (result) {
      setScore(result.overall);
      setFeedback(result.pass ? 'success' : 'error');
      answerQuestion(result.pass, target.id);
    } else {
      setScore(86);
      setFeedback('success');
      answerQuestion(true, target.id);
    }
    stoppingRef.current = false;
  };

  const nextHref = getNextGameHref(levelId, 'read_aloud', sessionId ?? activeSession?.id);

  return (
    <>
      <GameStatus levelId={levelId} gameType="read_aloud" progress={0.55} lives={activeSession?.lives ?? 3} remainingSec={remainingSec} />

      <section className="word-card card">
        <div className="word-card-row">
          <span className="word-emoji" aria-hidden="true">{target.emoji}</span>
          <div className="word-copy">
            <h1>{target.word}</h1>
            <p>{target.phonetic}</p>
          </div>
          <button type="button" className="round-icon-button" onClick={() => speakWord(target)} aria-label="播放示范音频">
            <Icon name="volume-2" size={20} />
          </button>
        </div>
      </section>

      <section className="mic-section">
        <div className="mic-button-wrap">
          {!isRecording ? <div className="mic-ring" aria-hidden="true" /> : null}
          <button
            type="button"
            className={`mic-button${isRecording ? ' is-recording' : ''}`}
            onPointerDown={start}
            onPointerUp={stop}
            onPointerCancel={stop}
            onKeyDown={(event) => { if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) { event.preventDefault(); start(); } }}
            onKeyUp={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); void stop(); } }}
            aria-label={isRecording ? '松开结束录音' : '按住麦克风跟读'}
          >
            <Icon name="mic" size={32} />
          </button>
        </div>
        <p className="eyebrow" style={{ marginTop: 16 }}>{recorder.state === 'assessing' ? '正在评估发音…' : recorder.state === 'degraded' ? '已切换为听音跟读模式' : '按住麦克风跟读'}</p>
        <div className="waveform" aria-hidden="true">
          {[20, 32, 16, 28, 20].map((height, index) => <span key={index} className="wave-bar" style={{ height }} />)}
        </div>
      </section>

      {feedback === 'success' && score !== null ? <div className="score-chip"><Icon name="check" size={16} />发音得分 {score}</div> : null}
      {feedback === 'error' && score !== null ? <FeedbackBanner kind="error">发音得分 {score}，再试一次吧。</FeedbackBanner> : null}

      <section className="game-next">
        <Link href={feedback === 'success' ? nextHref : '#'} aria-disabled={feedback !== 'success'} className="button button-block" onClick={(event) => { if (feedback !== 'success') event.preventDefault(); }} data-dom-id="cta-game-follow-instruction">
          下一题
        </Link>
      </section>
    </>
  );
}

export default ReadAloudGame;
