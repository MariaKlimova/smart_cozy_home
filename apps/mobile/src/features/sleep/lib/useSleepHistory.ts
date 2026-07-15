import { bedroomSensorMappingQueryKey, getActiveBedroomSensorEntityIds } from '@/config/resolveBedroomSensors';
import { getWeekEndForOffset } from '@/domain/sleepNightWindows';
import type { ISleepNightSummary } from '@/domain/sleepNight.typings';
import { useHaBackend } from '@/ha/useHaBackend';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useSleepScheduleStore } from '@/store/sleepScheduleStore';
import { useQuery } from '@tanstack/react-query';

import { loadSleepWeekData } from './loadSleepWeekData';

const SLEEP_HISTORY_STALE_MS = 5 * 60 * 1000;

export interface IUseSleepHistoryOptions {
  /** 0 = последние 7 ночей, 1 = предыдущая неделя */
  weekOffset?: number;
  /** Запрашивать данные */
  enabled?: boolean;
}

export interface IUseSleepHistoryResult {
  /** Сводки по ночам */
  nights: ISleepNightSummary[];
  /** Конец недели (день последней ночи) */
  weekEnd: Date;
  /** Идёт первая загрузка */
  isLoading: boolean;
  /** Идёт запрос */
  isFetching: boolean;
  /** Ошибка запроса */
  isError: boolean;
  /** Идёт обновление */
  isRefreshing: boolean;
  /** Перезагрузить */
  refetch: () => Promise<unknown>;
}

/** Загружает недельную историю качества среды во сне */
export function useSleepHistory(options?: IUseSleepHistoryOptions): IUseSleepHistoryResult {
  const weekOffset = options?.weekOffset ?? 0;
  const pollingEnabled = options?.enabled ?? true;
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const isNetworkAvailable = useConnectionStore((s) => s.isNetworkAvailable);
  const { haReady, baseUrl: haBaseUrl, token: haToken } = useHaBackend();
  const overrides = useBedroomSensorStore((s) => s.overrides);
  const getResolvedMapping = useBedroomSensorStore((s) => s.getResolvedMapping);
  const nightSchedule = useSleepScheduleStore((s) => s.schedule);

  const sensors = getResolvedMapping();
  const mappingKey = bedroomSensorMappingQueryKey(overrides);
  const sensorEntityIds = {
    co2: sensors.co2.entity,
    temperature: sensors.temperature.entity,
    humidity: sensors.humidity.entity,
  };
  const activeSensorIds = getActiveBedroomSensorEntityIds(sensors);
  const networkOk = isNetworkAvailable !== false;

  const query = useQuery({
    queryKey: ['sleep-history', baseUrl, weekOffset, mappingKey, nightSchedule.bedtime, nightSchedule.wakeTime],
    enabled: Boolean(pollingEnabled && haReady && networkOk && activeSensorIds.length > 0),
    staleTime: SLEEP_HISTORY_STALE_MS,
    queryFn: async () =>
      loadSleepWeekData({
        baseUrl: haBaseUrl,
        token: haToken,
        weekOffset,
        sensorEntityIds,
        nightSchedule,
      }),
  });

  return {
    nights: query.data?.nights ?? [],
    weekEnd: query.data?.weekEnd ?? getWeekEndForOffset(weekOffset),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isRefreshing: query.isFetching && !query.isPending,
    refetch: query.refetch,
  };
}
