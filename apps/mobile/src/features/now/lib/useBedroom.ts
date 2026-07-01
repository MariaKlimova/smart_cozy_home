import { useQuery } from '@tanstack/react-query';

import { bedroomSensorMappingQueryKey } from '@/config/resolveBedroomSensors';
import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import { fetchEntityStates } from '@/ha/haClient';
import { useHaBackend } from '@/ha/useHaBackend';
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
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const { haReady, baseUrl: haBaseUrl, token: haToken } = useHaBackend();
  const overrides = useBedroomSensorStore((s) => s.overrides);
  const getResolvedMapping = useBedroomSensorStore((s) => s.getResolvedMapping);
  const getActiveEntityIds = useBedroomSensorStore((s) => s.getActiveEntityIds);

  const sensors = getResolvedMapping();
  const entityIds = getActiveEntityIds();
  const outdoorEntityIds = [
    HA_ENTITIES.devices.outdoorTemperature,
    HA_ENTITIES.system.sun,
  ];
  const queryEntityIds = [...new Set([...entityIds, ...outdoorEntityIds])];
  const mappingKey = bedroomSensorMappingQueryKey(overrides);

  const query = useQuery({
    queryKey: ['bedroom-sensors', baseUrl, mappingKey, queryEntityIds],
    enabled: Boolean(
      pollingEnabled && haReady && entityIds.length > 0,
    ),
    staleTime: BEDROOM_STALE_MS,
    refetchInterval: pollingEnabled ? BEDROOM_STALE_MS : false,
    queryFn: async () => {
      const states = await fetchEntityStates(haBaseUrl, haToken, queryEntityIds);
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
