import { useQuery } from '@tanstack/react-query';

import { bedroomSensorMappingQueryKey } from '@/config/resolveBedroomSensors';
import { fetchEntityStates } from '@/ha/haClient';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useConnectionStore } from '@/store/connectionStore';

import type { IBedroomReadings } from './bedroomReadings.typings';
import { mapBedroomReadings } from './mapBedroomReadings';

const BEDROOM_STALE_MS = 30_000;

export interface IUseBedroomOptions {
  /** Опрашивать HA; false — только кэш (например, неактивная вкладка) */
  enabled?: boolean;
}

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
export function useBedroom(options?: IUseBedroomOptions): IUseBedroomResult {
  const pollingEnabled = options?.enabled ?? true;
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
    enabled: Boolean(
      pollingEnabled && isConnected && baseUrl && token && entityIds.length > 0,
    ),
    staleTime: BEDROOM_STALE_MS,
    refetchInterval: pollingEnabled ? BEDROOM_STALE_MS : false,
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
