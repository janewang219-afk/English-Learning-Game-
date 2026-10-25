/** WebSocket 客户端（浏览器侧），带有限重连和显式取消。 */
import type { LeaderboardEntry } from '@/types';
import { leaderboardChannel, type LeaderboardUpdateMessage } from './protocol';

export interface LeaderboardSubscription {
  unsubscribe: () => void;
}

export function subscribeLeaderboard(
  weekStart: Date,
  onUpdate: (entries: LeaderboardEntry[]) => void,
): LeaderboardSubscription {
  const url = process.env.NEXT_PUBLIC_WS_SERVER_URL || '';
  if (!url) {
    throw new Error('WS_SERVER_URL is not configured');
  }

  if (typeof WebSocket === 'undefined') throw new Error('WebSocket is not supported in this browser');
  const channel = leaderboardChannel(weekStart.toISOString().slice(0, 10));
  let socket: WebSocket | null = null;
  let stopped = false;
  let retries = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    if (stopped) return;
    socket = new WebSocket(url);
    socket.onopen = () => {
      retries = 0;
      socket?.send(JSON.stringify({ type: 'subscribe', channel }));
    };
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as LeaderboardUpdateMessage;
        if (message.type === 'leaderboard.update') onUpdate(message.entries.map((entry) => ({ ...entry, weekStart })));
      } catch {
        // 忽略无效的服务端消息，连接本身保持可用。
      }
    };
    socket.onclose = () => {
      if (stopped || retries >= 5) return;
      retries += 1;
      timer = setTimeout(connect, Math.min(5_000, 250 * 2 ** retries));
    };
  };

  connect();
  return {
    unsubscribe() {
      stopped = true;
      if (timer) clearTimeout(timer);
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'unsubscribe', channel }));
      socket?.close();
      socket = null;
    },
  };
}
