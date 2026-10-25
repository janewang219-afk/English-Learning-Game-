/**
 * 独立 WebSocket 服务：只负责连接、订阅和广播，不承担 Prisma 业务逻辑。
 * 生产环境可由 Redis pub/sub adapter 调用 broadcastToChannel。
 */
import { WebSocketServer, type WebSocket } from 'ws';
import {
  parseLeaderboardClientMessage,
  type LeaderboardUpdateMessage,
} from './protocol';

const PORT = Number(process.env.WS_PORT || 8080);
const subscriptions = new WeakMap<WebSocketServer, Map<string, Set<WebSocket>>>();
const socketChannels = new WeakMap<WebSocket, Set<string>>();

function sendJson(ws: WebSocket, payload: unknown): void {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

export function broadcastToChannel(wss: WebSocketServer, channel: string, message: LeaderboardUpdateMessage): void {
  const sockets = subscriptions.get(wss)?.get(channel);
  if (!sockets) return;
  for (const socket of sockets) sendJson(socket, message);
}

export function startWSServer(port: number = PORT): WebSocketServer {
  const wss = new WebSocketServer({ port });
  const channelSubscriptions = new Map<string, Set<WebSocket>>();
  subscriptions.set(wss, channelSubscriptions);

  wss.on('connection', (ws: WebSocket) => {
    const channels = new Set<string>();
    socketChannels.set(ws, channels);

    ws.on('message', (raw: Buffer) => {
      const message = parseLeaderboardClientMessage(raw.toString());
      if (!message) {
        sendJson(ws, { type: 'error', code: 'INVALID_MESSAGE' });
        return;
      }

      if (message.type === 'subscribe') {
        const sockets = channelSubscriptions.get(message.channel) ?? new Set<WebSocket>();
        sockets.add(ws);
        channelSubscriptions.set(message.channel, sockets);
        channels.add(message.channel);
        sendJson(ws, { type: 'subscribed', channel: message.channel });
        return;
      }

      channelSubscriptions.get(message.channel)?.delete(ws);
      channels.delete(message.channel);
      sendJson(ws, { type: 'unsubscribed', channel: message.channel });
    });

    ws.on('close', () => {
      for (const channel of channels) channelSubscriptions.get(channel)?.delete(ws);
      channels.clear();
    });
  });

  // eslint-disable-next-line no-console
  console.log(`[playlearn-ws] listening on :${port}`);
  return wss;
}

if (require.main === module) startWSServer();
