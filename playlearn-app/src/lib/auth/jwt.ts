/**
 * JWT 认证工具
 *
 * PRD §11 后端：认证采用 JWT + Refresh Token 方案，
 * 家长账号和儿童档案通过 role 字段区分权限。
 *
 * 业务实现待 P3 阶段完成；本文件提供类型与签名骨架。
 */
import { randomUUID } from 'node:crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';

export type AuthRole = 'parent' | 'child';

export interface PlayLearnJwtPayload extends JwtPayload {
  sub: string;          // parentAccountId 或 childProfileId
  role: AuthRole;
  type: 'access' | 'refresh';
  parentAccountId?: string;
  jti: string;
}

function requiredSecret(name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET', fallback: string) {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be configured in production`);
  }
  return fallback;
}

function accessSecret() { return requiredSecret('JWT_ACCESS_SECRET', 'dev-access-only'); }
function refreshSecret() { return requiredSecret('JWT_REFRESH_SECRET', 'dev-refresh-only'); }
function accessTtl() { return Number(process.env.JWT_ACCESS_TTL_SEC || 900); }
function refreshTtl() { return Number(process.env.JWT_REFRESH_TTL_SEC || 2592000); }
function childTtl() { return Number(process.env.JWT_CHILD_TTL_SEC || 1800); }

/** 签发 access token（15 分钟） */
export function signAccessToken(payload: Omit<PlayLearnJwtPayload, 'type' | 'iat' | 'exp' | 'jti'>): string {
  return jwt.sign({ ...payload, type: 'access', jti: randomUUID() }, accessSecret(), {
    expiresIn: accessTtl(),
  });
}

/** 签发 refresh token（30 天） */
export function signRefreshToken(payload: Omit<PlayLearnJwtPayload, 'type' | 'iat' | 'exp' | 'jti'>): string {
  return jwt.sign({ ...payload, type: 'refresh', jti: randomUUID() }, refreshSecret(), {
    expiresIn: refreshTtl(),
  });
}

/** 签发儿童端短期 access token，不允许使用 refresh token 刷新。 */
export function signChildAccessToken(childProfileId: string, parentAccountId: string): string {
  return jwt.sign({
    sub: childProfileId,
    parentAccountId,
    role: 'child',
    type: 'access',
    jti: randomUUID(),
  }, accessSecret(), { expiresIn: childTtl() });
}

/** 校验 access token */
export function verifyAccessToken(token: string): PlayLearnJwtPayload {
  return jwt.verify(token, accessSecret()) as PlayLearnJwtPayload;
}

/** 校验 refresh token */
export function verifyRefreshToken(token: string): PlayLearnJwtPayload {
  return jwt.verify(token, refreshSecret()) as PlayLearnJwtPayload;
}

/** 从 Authorization 头解析 token */
export function extractBearerToken(authHeader?: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim();
}

export function tokenTtlSeconds(payload: PlayLearnJwtPayload, fallback = 900): number {
  if (!payload.exp) return fallback;
  return Math.max(1, payload.exp - Math.floor(Date.now() / 1000));
}
