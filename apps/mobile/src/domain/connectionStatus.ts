import type { TConnectionFailureReason, TConnectionStatus } from '@/domain/connection.typings';

/** Входные данные для вычисления статуса подключения */
export interface IConnectionStatusInput {
  /** Профиль сохранён */
  hasProfile: boolean;
  /** Идёт проверка */
  isLoading: boolean;
  /** HA отвечает */
  isConnected: boolean;
  /** Доступность сети (null = ещё неизвестно) */
  isNetworkAvailable: boolean | null;
  /** Причина последней неудачи */
  failureReason: TConnectionFailureReason | null;
}

/** Вычисляет UI-статус подключения */
export function resolveConnectionStatus(input: IConnectionStatusInput): TConnectionStatus {
  const { hasProfile, isLoading, isConnected, isNetworkAvailable, failureReason } = input;

  if (!hasProfile) {
    return 'no_profile';
  }
  if (isLoading) {
    return 'connecting';
  }
  if (isNetworkAvailable === false) {
    return 'no_network';
  }
  if (isConnected) {
    return 'connected';
  }
  if (failureReason === 'token_invalid') {
    return 'token_invalid';
  }
  if (failureReason === 'no_url') {
    return 'error';
  }
  if (failureReason === 'ha_unavailable') {
    return 'ha_unavailable';
  }
  return 'error';
}

/** Нужно ли показывать баннер подключения */
export function shouldShowConnectionBanner(status: TConnectionStatus): boolean {
  return status !== 'connected' && status !== 'no_profile';
}

/** Ключ copy для сообщения по статусу */
export function connectionMessageKey(
  status: TConnectionStatus,
): 'checking' | 'noNetwork' | 'haUnavailable' | 'tokenExpired' | 'genericError' | null {
  switch (status) {
    case 'connecting':
      return 'checking';
    case 'no_network':
      return 'noNetwork';
    case 'ha_unavailable':
      return 'haUnavailable';
    case 'token_invalid':
      return 'tokenExpired';
    case 'error':
      return 'genericError';
    default:
      return null;
  }
}

/** Ключ copy для onboarding / connect error */
export function connectionFailureMessageKey(
  reason: TConnectionFailureReason | null,
): 'needUrl' | 'tokenExpired' | 'haUnavailable' | 'genericError' {
  if (reason === 'no_url') {
    return 'needUrl';
  }
  if (reason === 'token_invalid') {
    return 'tokenExpired';
  }
  if (reason === 'ha_unavailable') {
    return 'haUnavailable';
  }
  return 'genericError';
}
