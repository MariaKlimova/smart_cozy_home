import { bedroomSensorMappingQueryKey, getActiveBedroomSensorEntityIds } from '@/config/resolveBedroomSensors';
import type { ISleepSensorSample } from '@/domain/sleepNight.typings';
import { useHaBackend } from '@/ha/useHaBackend';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useQuery } from '@tanstack/react-query';

import { loadBedroomHistory24h, BEDROOM_HISTORY_24H_MS } from './loadBedroomHistory24h';

const BEDROOM_HISTORY_24H_STALE_MS = 5 * 60 * 1000;

export interface IUseBedroomHistory24hOptions {
  /** Запрашивать данные */
  enabled?: boolean;
}

export interface IUseBedroomHistory24hResult {
  /** Точки датчиков за 24 часа */
  samples: ISleepSensorSample[];
  /** Начало окна */
  startAt: Date;
  /** Конец окна */
  endAt: Date;
  /** Идёт первая загрузка */
  isLoading: boolean;
  /** Идёт запрос */
  isFetching: boolean;
  /** Ошибка запроса */
  isError: boolean;
  /** Есть ли настроенные датчики для графика */
  hasSensors: boolean;
}

/** Lazy-load time-series датчиков спальни за последние 24 часа */
export function useBedroomHistory24h(
  options: IUseBedroomHistory24hOptions = {},
): IUseBedroomHistory24hResult {
  const { enabled = true } = options;
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
  const hasSensors = activeSensorIds.length > 0;

  const query = useQuery({
    queryKey: ['bedroom-history-24h', baseUrl, mappingKey],
    enabled: Boolean(enabled && haReady && hasSensors),
    staleTime: BEDROOM_HISTORY_24H_STALE_MS,
    queryFn: async () =>
      loadBedroomHistory24h({
        baseUrl: haBaseUrl,
        token: haToken,
        endAt: new Date(),
        sensorEntityIds,
      }),
  });

  const endAt = query.data?.endAt ?? new Date();
  const startAt = query.data?.startAt ?? new Date(endAt.getTime() - BEDROOM_HISTORY_24H_MS);

  return {
    samples: query.data?.samples ?? [],
    startAt,
    endAt,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    hasSensors,
  };
}
