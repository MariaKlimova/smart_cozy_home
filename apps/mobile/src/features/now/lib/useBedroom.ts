import { useQuery } from '@tanstack/react-query';

import { bedroomSensorMappingQueryKey } from '@/config/resolveBedroomSensors';
import { fetchEntityStates } from '@/ha/haClient';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useConnectionStore } from '@/store/connectionStore';

import type { IBedroomReadings } from './bedroomReadings.typings';
import { mapBedroomReadings } from './mapBedroomReadings';

const BEDROOM_STALE_MS = 30_000;

export interface IUseBedroomResult {
  /** Показания датчиков */
  readings: IBedroomReadings | undefined;
  /** Идёт первая загрузка */
  isLoading: boolean;
  /** Ошибка запроса */
  isError: boolean;
  /** Идёт обновление (pull-to-refresh) */
  isRefreshing: boolean;
}

/** Загружает стейты датчиков спальни из HA (обновление каждые 30 с) */
export function useBedroom(): IUseBedroomResult {
  const isConnected = useConnectionStore((s) => s.isConnected);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const token = useConnectionStore((s) => s.profile?.accessToken);
  const overrides = useBedroomSensorStore((s) => s.overrides);
  const getResolvedMapping = useBedroomSensorStore((s) => s.getResolvedMapping);
  const getActiveEntityIds = useBedroomSensorStore((s) => s.getActiveEntityIds);

  const sensors = getResolvedMapping();
  const entityIds = getActiveEntityIds();
  const mappingKey = bedroomSensorMappingQueryKey(overrides);

  const query = useQuery({
    queryKey: ['bedroom-sensors', baseUrl, mappingKey, entityIds],
    enabled: Boolean(isConnected && baseUrl && token && entityIds.length > 0),
    staleTime: BEDROOM_STALE_MS,
    refetchInterval: BEDROOM_STALE_MS,
    queryFn: async () => {
      const states = await fetchEntityStates(baseUrl!, token!, entityIds);
      return mapBedroomReadings(states, sensors);
    },
  });

  return {
    readings: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    isRefreshing: query.isFetching && !query.isPending,
  };
}
