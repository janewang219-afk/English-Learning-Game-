export interface ApiSuccess<T> {
  data: T;
  requestId: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresInSec: number;
  parentAccount: {
    id: string;
    email: string;
    displayName: string;
  };
}

export interface ChildActivationResponse {
  accessToken: string;
  expiresInSec: number;
  childProfile: {
    id: string;
    nickname: string;
    avatar: string;
  };
}

export interface SessionSyncResponse {
  accepted: boolean;
  clientSyncId: string;
  duplicate: boolean;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  services: {
    postgres: { status: 'up' | 'down'; message?: string };
    redis: { status: 'up' | 'down'; message?: string };
  };
}
