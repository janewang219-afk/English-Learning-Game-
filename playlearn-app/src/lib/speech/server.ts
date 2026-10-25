/**
 * 服务端语音评估 provider。
 *
 * 默认使用 deterministic mock，避免开发环境把儿童录音发送到外部服务。
 * 生产环境可通过 SPEECH_PROVIDER=http 接入 Azure/阿里云等 HTTP 服务。
 */
import type { SpeechAssessmentResult } from './client';

export interface SpeechServerConfig {
  provider: 'mock' | 'http';
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  maxAudioBytes: number;
}

export interface SpeechProvider {
  assess(input: { audio: Blob; learningItemId?: string; referenceText?: string }): Promise<SpeechAssessmentResult>;
}

export function loadSpeechConfig(): SpeechServerConfig {
  const provider = process.env.SPEECH_PROVIDER === 'http' ? 'http' : 'mock';
  return {
    provider,
    baseUrl: process.env.SPEECH_API_BASE_URL || '',
    apiKey: process.env.SPEECH_API_KEY || '',
    timeoutMs: Math.min(3_000, Math.max(250, Number(process.env.SPEECH_API_TIMEOUT_MS || 3_000))),
    maxAudioBytes: Math.max(1, Number(process.env.SPEECH_MAX_AUDIO_BYTES || 1_048_576)),
  };
}

export class MockSpeechProvider implements SpeechProvider {
  async assess(): Promise<SpeechAssessmentResult> {
    return {
      overall: 80,
      phonemes: [],
      pass: true,
      degraded: false,
      mode: 'scored',
    };
  }
}

export class HttpSpeechProvider implements SpeechProvider {
  constructor(private readonly config: SpeechServerConfig) {}

  async assess(input: { audio: Blob; learningItemId?: string; referenceText?: string }): Promise<SpeechAssessmentResult> {
    if (!this.config.baseUrl) throw new Error('SPEECH_API_BASE_URL is not configured');
    const form = new FormData();
    form.append('audio', input.audio, 'playlearn-recording.webm');
    if (input.learningItemId) form.append('learningItemId', input.learningItemId);
    if (input.referenceText) form.append('referenceText', input.referenceText);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.config.apiKey ? { authorization: `Bearer ${this.config.apiKey}` } : undefined,
        body: form,
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`speech provider responded ${response.status}`);
      const payload = await response.json() as Partial<SpeechAssessmentResult>;
      const overall = Math.max(0, Math.min(100, Number(payload.overall ?? 0)));
      const phonemes = Array.isArray(payload.phonemes)
        ? payload.phonemes.map((entry) => ({
          phoneme: String(entry?.phoneme ?? ''),
          score: Math.max(0, Math.min(100, Number(entry?.score ?? 0))),
        }))
        : [];
      return { overall, phonemes, pass: overall >= 60, degraded: false, mode: 'scored' };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function getSpeechProvider(config = loadSpeechConfig()): SpeechProvider {
  return config.provider === 'http' ? new HttpSpeechProvider(config) : new MockSpeechProvider();
}

export async function assessOnServer(
  audioBlob: Blob,
  metadata?: { learningItemId?: string; referenceText?: string },
): Promise<SpeechAssessmentResult> {
  const config = loadSpeechConfig();
  if (audioBlob.size > config.maxAudioBytes) {
    throw new Error(`audio exceeds ${config.maxAudioBytes} bytes`);
  }
  return getSpeechProvider(config).assess({ audio: audioBlob, ...metadata });
}
