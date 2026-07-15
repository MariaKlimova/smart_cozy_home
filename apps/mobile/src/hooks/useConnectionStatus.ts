import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import {
  connectionMessageKey,
  resolveConnectionStatus,
  shouldShowConnectionBanner,
} from '@/domain/connectionStatus';
import type { TConnectionStatus } from '@/domain/connection.typings';
import { copy } from '@/copy/ru';
import { useConnectionStore } from '@/store/connectionStore';

/** Результат хука статуса подключения для UI */
export interface IUseConnectionStatusResult {
  /** Вычисленный статус */
  status: TConnectionStatus;
  /** Сообщение для пользователя */
  message: string | null;
  /** Показывать ли баннер */
  showBanner: boolean;
  /** Доступна ли кнопка «Проверить снова» */
  canRetry: boolean;
  /** Нужна ли переавторизация */
  needsReconnect: boolean;
}

export function useConnectionStatus(): IUseConnectionStatusResult {
  const { profile, isLoading, isConnected, isNetworkAvailable, failureReason } =
    useConnectionStore(
      useShallow((s) => ({
        profile: s.profile,
        isLoading: s.isLoading,
        isConnected: s.isConnected,
        isNetworkAvailable: s.isNetworkAvailable,
        failureReason: s.failureReason,
      })),
    );

  return useMemo(() => {
    const status = resolveConnectionStatus({
      hasProfile: Boolean(profile),
      isLoading,
      isConnected,
      isNetworkAvailable,
      failureReason,
    });

    const messageKey = connectionMessageKey(status);
    let message: string | null = null;
    if (messageKey) {
      message = copy.connection[messageKey];
    }

    const canRetry = status === 'ha_unavailable' || status === 'error';
    const needsReconnect = status === 'token_invalid';

    return {
      status,
      message,
      showBanner: shouldShowConnectionBanner(status),
      canRetry,
      needsReconnect,
    };
  }, [profile, isLoading, isConnected, isNetworkAvailable, failureReason]);
}
