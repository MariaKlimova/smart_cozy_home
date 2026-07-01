import { canUseHaBackend } from '@/ha/haClient';

/** Base URL mock-store, когда профиль HA не задан */
export const MOCK_HA_BASE_URL = 'mock://ha';

/** Токен-заглушка для mock-store */
export const MOCK_HA_TOKEN = 'mock-token';

/** Контекст для REST-вызовов HA (реальный профиль или mock) */
export interface IHaBackendContext {
  /** Можно ли читать/писать HA */
  haReady: boolean;
  /** URL для REST/WS */
  baseUrl: string;
  /** Bearer-токен */
  token: string;
}

/** Резолвит haReady и credentials без React (store, domain runners) */
export function resolveHaBackend(
  isConnected: boolean,
  baseUrl: string | null | undefined,
  token: string | null | undefined,
): IHaBackendContext {
  const haReady = canUseHaBackend(isConnected, baseUrl, token);
  return {
    haReady,
    baseUrl: baseUrl ?? MOCK_HA_BASE_URL,
    token: token ?? MOCK_HA_TOKEN,
  };
}
