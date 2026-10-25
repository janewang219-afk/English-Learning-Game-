/**
 * 离线缓存（IndexedDB）— 客户端持久化
 *
 * PRD §11 前端：利用 IndexedDB 缓存学习数据和内容素材，确保弱网下学习不中断。
 * PRD §10 离线容错：关卡结算数据缓存在 localStorage（注：PRD 此处将 IndexedDB/localStorage
 * 用作同义离线存储，本脚手架统一使用 IndexedDB 以获得结构化查询能力）。
 *
 * Demo 版实际维护内容缓存、掌握度记录和待同步会话队列。
 */

import type { GameSession, MasteryRecord } from '@/types';

const DB_NAME = 'playlearn-cache';
const DB_VERSION = 1;

/** Object Store 名称（每个对应一类缓存数据） */
export const STORES = {
  THEMES: 'themes',
  LEVELS: 'levels',
  ITEMS: 'learningItems',
  MASTERY: 'masteryRecords',
  PENDING_SYNCS: 'pendingSyncs',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

/**
 * 打开 IndexedDB 连接（懒初始化，仅客户端可用）。
 * 在 SSR / Node 环境调用时应抛出清晰错误。
 */
export async function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB not available in this environment');
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB'));
    request.onupgradeneeded = () => {
      const db = request.result;
      Object.values(STORES).forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

/** 通用读取 */
export async function get<T>(store: StoreName, key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T | undefined);
  });
}

/** 通用写入 */
export async function put<T>(store: StoreName, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readwrite').objectStore(store).put(value);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/** 缓存关卡结算数据，等待网络恢复后批量同步 */
export async function enqueuePendingSync(session: GameSession, masteryUpdates: MasteryRecord[]): Promise<void> {
  await put(STORES.PENDING_SYNCS, { id: session.id, session, masteryUpdates });
}

export interface PendingSyncRecord {
  id: string;
  session: GameSession;
  masteryUpdates: MasteryRecord[];
}

/** 查看待同步的会话（不会清空队列） */
export async function listPendingSyncs(): Promise<PendingSyncRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORES.PENDING_SYNCS, 'readonly').objectStore(STORES.PENDING_SYNCS).getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as PendingSyncRecord[]);
  });
}

/** 删除一条已成功同步的会话 */
export async function removePendingSync(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORES.PENDING_SYNCS, 'readwrite').objectStore(STORES.PENDING_SYNCS).delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/** 取出并清空待同步的会话（兼容旧调用方） */
export async function drainPendingSyncs(): Promise<GameSession[]> {
  const values = await listPendingSyncs();
  await Promise.all(values.map((value) => removePendingSync(value.id)));
  return values.map((value) => value.session);
}
