import { create } from 'zustand';

import { loadSleepSchedule, saveSleepSchedule } from '@/config/sleepScheduleStorage';
import { DEFAULT_NIGHT_SCHEDULE } from '@/domain/nightSchedule';
import type { INightSchedule } from '@/domain/nightSchedule.typings';

interface ISleepScheduleStore {
  /** Текущее расписание ночи */
  schedule: INightSchedule;
  /** Загрузка из storage завершена */
  hasHydrated: boolean;
  /** Загрузить сохранённое расписание */
  hydrate: () => Promise<void>;
  /** Обновить и сохранить расписание */
  setSchedule: (schedule: INightSchedule) => Promise<void>;
  /** Текущее расписание (после hydrate) */
  getSchedule: () => INightSchedule;
}

let hydratePromise: Promise<void> | null = null;

export const useSleepScheduleStore = create<ISleepScheduleStore>((set, get) => ({
  schedule: DEFAULT_NIGHT_SCHEDULE,
  hasHydrated: false,

  hydrate: () => {
    if (hydratePromise) return hydratePromise;

    hydratePromise = (async () => {
      const saved = await loadSleepSchedule();
      set({
        schedule: saved ?? DEFAULT_NIGHT_SCHEDULE,
        hasHydrated: true,
      });
    })();

    return hydratePromise;
  },

  setSchedule: async (schedule) => {
    await saveSleepSchedule(schedule);
    set({ schedule });
  },

  getSchedule: () => get().schedule,
}));

void useSleepScheduleStore.getState().hydrate();
