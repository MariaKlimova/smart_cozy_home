import { create } from 'zustand';

import type { IConnectionProfile, TConnectionFailureReason } from '@/domain/connection.typings';
import {
  clearConnectionProfile,
  loadConnectionProfile,
  saveConnectionProfile,
} from '@/ha/connectionStorage';
import { resolveActiveBaseUrl } from '@/ha/connectionManager';
import {
  MOCK_CONNECTION_PROFILE,
  MOCK_HA_BASE_URL,
} from '@/ha/haBackend';
import { USE_HA_MOCKS } from '@/ha/haClient';
import { setCachedNetworkAvailable } from '@/ha/networkReachability';

interface IConnectionStore {
  /** Профиль из secure storage */
  profile: IConnectionProfile | null;
  /** Активный base URL после resolve */
  baseUrl: string | null;
  /** Подключение установлено */
  isConnected: boolean;
  /** Идёт проверка / hydrate */
  isLoading: boolean;
  /** Первичная загрузка профиля из storage завершена */
  hasHydrated: boolean;
  /** Причина последней неудачи */
  failureReason: TConnectionFailureReason | null;
  /** Доступность интернета (null = ещё неизвестно) */
  isNetworkAvailable: boolean | null;
  /** Загрузить профиль и подключиться */
  hydrate: () => Promise<void>;
  /** Сохранить и подключиться */
  connect: (profile: IConnectionProfile) => Promise<void>;
  /** Повторная проверка подключения */
  retry: () => Promise<void>;
  /** Обновить доступность сети */
  setNetworkAvailable: (available: boolean | null) => void;
  /** Очистить профиль и сбросить состояние подключения */
  disconnect: () => Promise<void>;
}

interface IMockConnectionState {
  /** Профиль для UI */
  profile: IConnectionProfile;
  /** Mock base URL */
  baseUrl: string;
  /** Подключение считается активным */
  isConnected: boolean;
  /** Причина неудачи отсутствует */
  failureReason: null;
  /** Сеть доступна */
  isNetworkAvailable: true;
}

function resolveMockConnection(profile: IConnectionProfile | null): IMockConnectionState {
  return {
    profile: profile ?? MOCK_CONNECTION_PROFILE,
    baseUrl: MOCK_HA_BASE_URL,
    isConnected: true,
    failureReason: null,
    isNetworkAvailable: true,
  };
}

function applyHealthResult(
  health: Awaited<ReturnType<typeof resolveActiveBaseUrl>>,
): Pick<IConnectionStore, 'baseUrl' | 'isConnected' | 'failureReason'> {
  return {
    baseUrl: health.ok ? health.baseUrl : null,
    isConnected: health.ok,
    failureReason: health.ok ? null : health.failureReason ?? 'unknown',
  };
}

let hydratePromise: Promise<void> | null = null;

export const useConnectionStore = create<IConnectionStore>((set, get) => ({
  profile: null,
  baseUrl: null,
  isConnected: false,
  isLoading: true,
  hasHydrated: false,
  failureReason: null,
  isNetworkAvailable: null,

  hydrate: () => {
    if (hydratePromise) return hydratePromise;

    hydratePromise = (async () => {
      set({ isLoading: true, failureReason: null });
      try {
        const profile = await loadConnectionProfile();

        if (USE_HA_MOCKS) {
          const mockState = resolveMockConnection(profile);
          set({
            ...mockState,
            isLoading: false,
            hasHydrated: true,
          });
          return;
        }

        if (!profile) {
          set({
            profile: null,
            baseUrl: null,
            isConnected: false,
            isLoading: false,
            hasHydrated: true,
            failureReason: null,
          });
          return;
        }

        const health = await resolveActiveBaseUrl(profile);
        set({
          profile,
          ...applyHealthResult(health),
          isLoading: false,
          hasHydrated: true,
        });
      } catch {
        set({
          profile: null,
          baseUrl: null,
          isConnected: false,
          isLoading: false,
          hasHydrated: true,
          failureReason: 'unknown',
        });
      }
    })();

    return hydratePromise;
  },

  connect: async (profile) => {
    set({ isLoading: true, failureReason: null });
    try {
      if (USE_HA_MOCKS) {
        const mockState = resolveMockConnection(profile);
        set({
          ...mockState,
          isLoading: false,
          hasHydrated: true,
        });
        return;
      }

      await saveConnectionProfile(profile);
      const health = await resolveActiveBaseUrl(profile);
      set({
        profile,
        ...applyHealthResult(health),
      });
    } catch {
      set({
        profile,
        baseUrl: null,
        isConnected: false,
        failureReason: 'unknown',
      });
    } finally {
      set({ isLoading: false, hasHydrated: true });
    }
  },

  retry: async () => {
    const { profile, isLoading, isNetworkAvailable } = get();
    if (!profile || isLoading || USE_HA_MOCKS) {
      return;
    }

    if (isNetworkAvailable === false) {
      return;
    }

    set({ isLoading: true });
    try {
      const health = await resolveActiveBaseUrl(profile);
      set({
        ...applyHealthResult(health),
        isLoading: false,
      });
    } catch {
      set({
        baseUrl: null,
        isConnected: false,
        failureReason: 'unknown',
        isLoading: false,
      });
    }
  },

  setNetworkAvailable: (available) => {
    const prev = get().isNetworkAvailable;
    setCachedNetworkAvailable(available);
    set({ isNetworkAvailable: available });

    if (available === true && prev === false) {
      const { profile, isConnected, isLoading } = get();
      if (profile && !isConnected && !isLoading) {
        void get().retry();
      }
    }
  },

  disconnect: async () => {
    if (!USE_HA_MOCKS) {
      await clearConnectionProfile();
    }
    hydratePromise = null;
    set({
      profile: null,
      baseUrl: null,
      isConnected: false,
      failureReason: null,
      isLoading: false,
      isNetworkAvailable: get().isNetworkAvailable,
    });
    if (USE_HA_MOCKS) {
      void useConnectionStore.getState().hydrate();
    }
  },
}));

void useConnectionStore.getState().hydrate();
