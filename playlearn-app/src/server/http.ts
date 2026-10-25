import { randomUUID } from 'node:crypto';
import { z, type ZodType } from 'zod';

export type RouteContext = { params?: Record<string, string> };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message = '请求参数无效', details?: unknown): ApiError {
  return new ApiError(400, 'BAD_REQUEST', message, details);
}

export function unauthorized(message = '请先登录'): ApiError {
  return new ApiError(401, 'UNAUTHORIZED', message);
}

export function forbidden(message = '没有访问权限'): ApiError {
  return new ApiError(403, 'FORBIDDEN', message);
}

export function notFound(message = '资源不存在'): ApiError {
  return new ApiError(404, 'NOT_FOUND', message);
}

export function conflict(message = '资源状态冲突', details?: unknown): ApiError {
  return new ApiError(409, 'CONFLICT', message, details);
}

export function notImplemented(route: string): ApiError {
  return new ApiError(501, 'NOT_IMPLEMENTED', `${route} 业务尚未实现`);
}

export function serviceUnavailable(message = '服务暂时不可用', details?: unknown): ApiError {
  return new ApiError(503, 'SERVICE_UNAVAILABLE', message, details);
}

export function getRequestId(request: Request): string {
  return request.headers.get('x-request-id')?.slice(0, 128) || randomUUID();
}

function responseHeaders(requestId: string, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  headers.set('x-request-id', requestId);
  return headers;
}

export function jsonData<T>(request: Request, data: T, status = 200, extra?: HeadersInit): Response {
  const requestId = getRequestId(request);
  return new Response(JSON.stringify({ data, requestId }), {
    status,
    headers: responseHeaders(requestId, extra),
  });
}

export function jsonError(request: Request, error: ApiError): Response {
  const requestId = getRequestId(request);
  return new Response(JSON.stringify({
    error: {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    },
    requestId,
  }), {
    status: error.status,
    headers: responseHeaders(requestId),
  });
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest('请求体必须是有效 JSON');
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw badRequest('请求体校验失败', parsed.error.flatten());
  }
  return parsed.data;
}

export function parseQuery<T>(request: Request, schema: ZodType<T>): T {
  const values = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    throw badRequest('查询参数校验失败', parsed.error.flatten());
  }
  return parsed.data;
}

export function withRoute(
  handler: (request: Request, context: RouteContext) => Promise<Response> | Response,
) {
  return async (request: Request, context: RouteContext = {}): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) return jsonError(request, error);
      if (error instanceof z.ZodError) return jsonError(request, badRequest('请求参数校验失败', error.flatten()));
      console.error('[playlearn-api] unexpected route error', error);
      return jsonError(request, new ApiError(500, 'INTERNAL_ERROR', '服务器内部错误'));
    }
  };
}
