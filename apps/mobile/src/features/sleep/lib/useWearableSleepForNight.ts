import type { ISleepNightWindow } from '@/domain/sleepNight.typings';
import { loadWearableSleepNight } from '@/health/healthKitClient';
import type { IWearableSleepNightResult } from '@/health/healthKitSleep.typings';
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

  const query = useQuery({
    queryKey: ['wearable-sleep-night', nightDate],
    enabled: Boolean(enabled && nightWindow !== null),
    staleTime: WEARABLE_SLEEP_STALE_MS,
    queryFn: async () => loadWearableSleepNight(nightWindow as ISleepNightWindow),
  });

  return {
    wearable: query.data ?? null,
    isLoading: query.isPending,
  };
}
