import { bedroomSensorMappingQueryKey, getActiveBedroomSensorEntityIds } from '@/config/resolveBedroomSensors';
import type { ISleepNightWindow, ISleepSensorSample } from '@/domain/sleepNight.typings';
import { useHaBackend } from '@/ha/useHaBackend';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useQuery } from '@tanstack/react-query';

import { loadSleepNightSamples } from './loadSleepNightSamples';

const SLEEP_NIGHT_SAMPLES_STALE_MS = 5 * 60 * 1000;

export interface IUseSleepNightSamplesOptions {
  /** Окно ночи */
  nightWindow: ISleepNightWindow | null;
  /** Смещение недели */
  weekOffset: number;
  /** Запрашивать данные */
  enabled?: boolean;
}

export interface IUseSleepNightSamplesResult {
  /** Точки датчиков за ночь */
  samples: ISleepSensorSample[];
  /** Идёт первая загрузка */
  isLoading: boolean;
  /** Идёт запрос */
  isFetching: boolean;
  /** Ошибка запроса */
  isError: boolean;
}

/** Lazy-load time-series для графика одной ночи */
export function useSleepNightSamples(
  options: IUseSleepNightSamplesOptions,
): IUseSleepNightSamplesResult {
  const { nightWindow, weekOffset, enabled = true } = options;
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const { haReady, baseUrl: haBaseUrl, token: haToken } = useHaBackend();
  const overrides = useBedroomSensorStore((s) => s.overrides);
  const getResolvedMapping = useBedroomSensorStore((s) => s.getResolvedMapping);

  const sensors = getResolvedMapping();
  const mappingKey = bedroomSensorMappingQueryKey(overrides);
  const sensorEntityIds = {
    co2: sensors.co2.entity,
    temperature: sensors.temperature.entity,
    humidity: sensors.humidity.entity,
  };
  const activeSensorIds = getActiveBedroomSensorEntityIds(sensors);
  const nightDate = nightWindow?.nightDate ?? '';

  const query = useQuery({
    queryKey: ['sleep-night-samples', baseUrl, nightDate, weekOffset, mappingKey],
    enabled: Boolean(enabled && haReady && activeSensorIds.length > 0 && nightWindow !== null),
    staleTime: SLEEP_NIGHT_SAMPLES_STALE_MS,
    queryFn: async () =>
      loadSleepNightSamples({
        baseUrl: haBaseUrl,
        token: haToken,
        nightWindow: nightWindow as ISleepNightWindow,
        weekOffset,
        sensorEntityIds,
      }),
  });

  return {
    samples: query.data ?? [],
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
  };
}
