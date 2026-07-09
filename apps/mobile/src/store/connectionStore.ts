import { create } from 'zustand';

import type { IConnectionProfile } from '@/domain/connection.typings';
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
  /** Ошибка подключения */
  error: string | null;
  /** Загрузить профиль и подключиться */
  hydrate: () => Promise<void>;
  /** Сохранить и подключиться */
  connect: (profile: IConnectionProfile) => Promise<void>;
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
  /** Ошибок нет */
  error: null;
}

function resolveMockConnection(profile: IConnectionProfile | null): IMockConnectionState {
  return {
    profile: profile ?? MOCK_CONNECTION_PROFILE,
    baseUrl: MOCK_HA_BASE_URL,
    isConnected: true,
    error: null,
  };
}

let hydratePromise: Promise<void> | null = null;

export const useConnectionStore = create<IConnectionStore>((set) => ({
  profile: null,
  baseUrl: null,
  isConnected: false,
  isLoading: true,
  hasHydrated: false,
  error: null,

  hydrate: () => {
    if (hydratePromise) return hydratePromise;

    hydratePromise = (async () => {
      set({ isLoading: true, error: null });
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
            error: null,
          });
          return;
        }

        const health = await resolveActiveBaseUrl(profile);
        set({
          profile,
          baseUrl: health.ok ? health.baseUrl : null,
          isConnected: health.ok,
          isLoading: false,
          hasHydrated: true,
          error: health.ok ? null : health.error ?? 'Ошибка подключения',
        });
      } catch {
        set({
          profile: null,
          baseUrl: null,
          isConnected: false,
          isLoading: false,
          hasHydrated: true,
          error: 'Не удалось загрузить настройки',
        });
      }
    })();

    return hydratePromise;
  },

  connect: async (profile) => {
    set({ isLoading: true, error: null });
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
        baseUrl: health.ok ? health.baseUrl : null,
        isConnected: health.ok,
        error: health.ok ? null : health.error ?? 'Ошибка подключения',
      });
    } catch {
      set({
        profile,
        baseUrl: null,
        isConnected: false,
        error: 'Не удалось сохранить подключение',
      });
    } finally {
      set({ isLoading: false, hasHydrated: true });
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
      error: null,
      isLoading: false,
    });
    if (USE_HA_MOCKS) {
      void useConnectionStore.getState().hydrate();
    }
  },
}));

void useConnectionStore.getState().hydrate();
