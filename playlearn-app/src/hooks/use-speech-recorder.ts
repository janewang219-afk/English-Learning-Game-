'use client';

/**
 * useSpeechRecorder — 录音与评估的 React Hook
 *
 * PRD §11 前端：使用 Web Speech API（兼容性检测后降级）。
 * 真实语音服务不可用时自动回退为听音跟读，不阻塞 Demo 流程。
 */
import { useCallback, useRef, useState } from 'react';
import { isSpeechSupported, startRecording, assessRecording, type SpeechAssessmentResult } from '@/lib/speech';

export type RecorderState = 'idle' | 'recording' | 'assessing' | 'degraded';

export interface UseSpeechRecorder {
  supported: boolean;
  state: RecorderState;
  result: SpeechAssessmentResult | null;
  start: () => Promise<void>;
  stop: () => Promise<SpeechAssessmentResult | null>;
}

export function useSpeechRecorder(): UseSpeechRecorder {
  const supported = isSpeechSupported();
  const [state, setState] = useState<RecorderState>('idle');
  const [result, setResult] = useState<SpeechAssessmentResult | null>(null);
  const stopFnRef = useRef<(() => Promise<Blob>) | null>(null);

  const start = useCallback(async () => {
    if (!supported) {
      setState('degraded');
      return;
    }
    try {
      stopFnRef.current = await startRecording();
      setState('recording');
    } catch {
      setState('degraded');
    }
  }, [supported]);

  const stop = useCallback(async () => {
    if (!stopFnRef.current) {
      setState('degraded');
      return null;
    }
    setState('assessing');
    try {
      const blob = await stopFnRef.current();
      const assessment = await assessRecording(blob);
      setResult(assessment);
      setState('idle');
      stopFnRef.current = null;
      return assessment;
    } catch {
      setState('degraded');
      stopFnRef.current = null;
      return null;
    }
  }, []);

  return { supported, state, result, start, stop };
}
