/**
 * 密码哈希工具
 *
 * PRD §11 后端：家长注册 + 登录流程。
 * 使用 bcryptjs 进行密码哈希与校验。
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
