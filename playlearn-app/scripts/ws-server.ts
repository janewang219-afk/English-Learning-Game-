// scripts/ws-server.ts — 本地启动 WebSocket 服务（dev only）
// 通过 `pnpm ws:dev` 调用 tsx 运行此文件。
import { startWSServer } from '../src/lib/websocket/server';

startWSServer();
