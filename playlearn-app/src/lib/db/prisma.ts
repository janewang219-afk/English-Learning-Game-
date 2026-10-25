/**
 * Prisma 客户端单例
 *
 * PRD §11 数据库：PostgreSQL 作为主数据库。
 * 部署到 Vercel 后每个 Serverless Function 容器共享此单例。
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __playlearnPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__playlearnPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__playlearnPrisma = prisma;
}
