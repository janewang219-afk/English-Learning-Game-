/**
 * 语音评估引擎（客户端侧）— Web Speech API 兼容性检测与降级
 *
 * PRD §9.2、§11：使用浏览器原生 Web Speech API（兼容性检测后降级）。
 *   - onRecordingComplete：发送录音至 /api/speech/assess
 *   - 权限拒绝 / 网络异常 → 降级为"听音跟唱"模式（仅播放示范音，不评分）
 *
 * 服务端侧的第三方 API 调用见 src/lib/speech/server.ts。
 */

export interface SpeechAssessmentResult {
  overall: number;       // 0-100
  phonemes: Array<{ phoneme: string; score: number }>;
  pass: boolean;         // >= 60 视为过关
  degraded?: boolean;    // provider 不可用时进入听音跟唱降级模式
  mode?: 'scored' | 'listen_only';
}

/** 检测当前环境是否支持录音 */
export function isSpeechSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  return !!(navigator.mediaDevices && typeof MediaRecorder !== 'undefined');
}

/**
 * 启动录音。返回一个停止函数。
 * 浏览器支持时采集录音并尝试调用评估 API；失败时由 Hook 降级。
 */
export async function startRecording(opts?: { onLevel?: (level: number) => void }): Promise<() => Promise<Blob>> {
  if (!isSpeechSupported()) throw new Error('Recording is not supported in this browser');

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) chunks.push(event.data);
    opts?.onLevel?.(event.data.size ? 1 : 0);
  });
  recorder.start();

  return () => new Promise<Blob>((resolve) => {
    recorder.addEventListener('stop', () => {
      stream.getTracks().forEach((track) => track.stop());
      resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
    }, { once: true });
    recorder.stop();
  });
}

/**
 * 评估录音：调用 /api/speech/assess，返回音素级评分。
 */
export async function assessRecording(audio: Blob): Promise<SpeechAssessmentResult> {
  const body = new FormData();
  body.append('audioBlob', audio, 'playlearn-recording.webm');
  const response = await fetch('/api/speech/assess', { method: 'POST', body });
  if (!response.ok) throw new Error(`Speech assessment failed: ${response.status}`);
  return response.json() as Promise<SpeechAssessmentResult>;
}
