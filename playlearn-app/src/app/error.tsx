'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // TODO: 接入 Sentry 类错误监控
    console.error('PlayLearn runtime error:', error);
  }, [error]);

  return (
    <main role="alert" aria-live="assertive">
      <p>出了点小问题。</p>
      <button onClick={reset}>重试</button>
    </main>
  );
}
