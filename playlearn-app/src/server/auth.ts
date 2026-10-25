import { prisma } from '@/lib/db';
import { extractBearerToken, verifyAccessToken, type AuthRole, type PlayLearnJwtPayload } from '@/lib/auth';
import { forbidden, unauthorized, type ApiError } from './http';

export interface AuthContext {
  sub: string;
  role: AuthRole;
  parentAccountId?: string;
  jti: string;
  payload: PlayLearnJwtPayload;
}

export function authenticate(request: Request): AuthContext {
  const token = extractBearerToken(request.headers.get('authorization'));
  if (!token) throw unauthorized();

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access' || !payload.sub || !payload.jti) throw new Error('invalid access token');
    return {
      sub: payload.sub,
      role: payload.role,
      parentAccountId: payload.parentAccountId,
      jti: payload.jti,
      payload,
    };
  } catch {
    throw unauthorized('登录状态已失效');
  }
}

export function requireRole(context: AuthContext, role: AuthRole): AuthContext {
  if (context.role !== role) throw forbidden();
  return context;
}

export function requireParent(request: Request): AuthContext {
  return requireRole(authenticate(request), 'parent');
}

export function requireChild(request: Request): AuthContext {
  return requireRole(authenticate(request), 'child');
}

export function requireParentOrChild(request: Request): AuthContext {
  return authenticate(request);
}

export async function assertChildAccess(context: AuthContext, childProfileId: string): Promise<void> {
  if (context.role === 'child') {
    if (context.sub !== childProfileId) throw forbidden();
    return;
  }

  const child = await prisma.childProfile.findFirst({
    where: { id: childProfileId, parentAccountId: context.sub },
    select: { id: true },
  });
  if (!child) throw forbidden();
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === 'ApiError';
}
