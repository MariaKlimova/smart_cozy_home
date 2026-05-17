import { create } from 'zustand';

import { loadConnectionProfile, saveConnectionProfile } from '@/ha/connectionStorage';
import { resolveActiveBaseUrl } from '@/ha/connectionManager';
import type { IConnectionProfile } from '@/ha/types';

interface IConnectionStore {
  /** Профиль из secure storage */
  profile: IConnectionProfile | null;
  /** Активный base URL после resolve */
  baseUrl: string | null;
  /** Подключение установлено */
  isConnected: boolean;
  /** Идёт проверка */
  isLoading: boolean;
  /** Ошибка подключения */
  error: string | null;
  /** Загрузить профиль и подключиться */
  hydrate: () => Promise<void>;
  /** Сохранить и подключиться */
  connect: (profile: IConnectionProfile) => Promise<void>;
}

export const useConnectionStore = create<IConnectionStore>((set) => ({
  profile: null,
  baseUrl: null,
  isConnected: false,
  isLoading: true,
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await loadConnectionProfile();
      if (!profile) {
        set({ profile: null, isConnected: false });
        return;
      }
      const health = await resolveActiveBaseUrl(profile);
      set({
        profile,
        baseUrl: health.ok ? health.baseUrl : null,
        isConnected: health.ok,
        error: health.ok ? null : health.error ?? 'Ошибка подключения',
      });
    } catch {
      set({ profile: null, isConnected: false, error: 'Не удалось загрузить настройки' });
    } finally {
      set({ isLoading: false });
    }
  },

  connect: async (profile) => {
    set({ isLoading: true, error: null });
    try {
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
      set({ isLoading: false });
    }
  },
}));
