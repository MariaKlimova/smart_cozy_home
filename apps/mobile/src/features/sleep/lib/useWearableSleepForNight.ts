import type { ISleepNightWindow } from '@/domain/sleepNight.typings';
import { loadWearableSleepNight } from '@/health/healthKitClient';
import type { IWearableSleepNightResult } from '@/health/healthKitSleep.typings';
import { useSleepScheduleStore } from '@/store/sleepScheduleStore';
import { useQuery } from '@tanstack/react-query';

const WEARABLE_SLEEP_STALE_MS = 5 * 60 * 1000;

export interface IUseWearableSleepForNightOptions {
  /** Окно ночи */
  nightWindow: ISleepNightWindow | null;
  /** Запрашивать данные */
  enabled?: boolean;
}

export interface IUseWearableSleepForNightResult {
  /** Результат загрузки wearable */
  wearable: IWearableSleepNightResult | null;
  /** Идёт первая загрузка */
  isLoading: boolean;
}

/** Загружает данные сна с носимого за выбранную ночь */
export function useWearableSleepForNight(
  options: IUseWearableSleepForNightOptions,
): IUseWearableSleepForNightResult {
  const { nightWindow, enabled = true } = options;
  const nightDate = nightWindow?.nightDate ?? '';
  const nightSchedule = useSleepScheduleStore((s) => s.schedule);

  const query = useQuery({
    queryKey: ['wearable-sleep-night', nightDate, nightSchedule.bedtime, nightSchedule.wakeTime],
    enabled: Boolean(enabled && nightWindow !== null),
    staleTime: WEARABLE_SLEEP_STALE_MS,
    queryFn: async () => loadWearableSleepNight(nightWindow as ISleepNightWindow, nightSchedule),
  });

  return {
    wearable: query.data ?? null,
    isLoading: query.isPending,
  };
}
