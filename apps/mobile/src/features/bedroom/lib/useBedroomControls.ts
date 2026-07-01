import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { bedroomDeviceMappingQueryKey, getActiveBedroomDeviceEntityIds, resolveBedroomDevices } from '@/config/resolveBedroomDevices';
import type { TBedroomDeviceAction } from '@/domain/bedroomDeviceAction.typings';
import type { IBedroomDeviceState } from '@/domain/bedroomDevice.typings';
import { setBedroomDevice } from '@/domain/bedroomDeviceControl';
import { fetchEntityStates } from '@/ha/haClient';
import { useHaBackend } from '@/ha/useHaBackend';
import { mapBedroomDevices } from '@/ha/mappers/domainMapper';
import { useBedroomDeviceStore } from '@/store/bedroomDeviceStore';
import { useConnectionStore } from '@/store/connectionStore';

const BEDROOM_DEVICES_STALE_MS = 30_000;

export interface IUseBedroomControlsOptions {
  /** Опрашивать HA; false — только кэш (например, неактивная вкладка) */
  enabled?: boolean;
}

export interface IUseBedroomControlsResult {
  /** Состояния устройств спальни */
  devices: IBedroomDeviceState[] | undefined;
  /** Идёт первая загрузка */
  isLoading: boolean;
  /** Ошибка запроса */
  isError: boolean;
  /** Идёт обновление (pull-to-refresh) */
  isRefreshing: boolean;
  /** id устройства с активной командой */
  pendingDeviceId: string | undefined;
  /** Установить значение slider; false — команда не применилась */
  setSlider: (deviceId: string, value: number) => Promise<boolean>;
  /** Переключить toggle; false — команда не применилась */
  setToggle: (deviceId: string, isOn: boolean) => Promise<boolean>;
  /** Выбрать сегмент; false — команда не применилась */
  setSegment: (deviceId: string, optionId: string) => Promise<boolean>;
  /** Обновить состояния */
  refresh: () => Promise<void>;
}

/** Загрузка и управление устройствами спальни через HA */
export function useBedroomControls(
  options?: IUseBedroomControlsOptions,
): IUseBedroomControlsResult {
  const pollingEnabled = options?.enabled ?? true;
  const queryClient = useQueryClient();
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const { haReady, baseUrl: haBaseUrl, token: haToken } = useHaBackend();
  const config = useBedroomDeviceStore((s) => s.config);
  const entityIds = useMemo(
    () => getActiveBedroomDeviceEntityIds(resolveBedroomDevices(config)),
    [config],
  );
  const mappingKey = bedroomDeviceMappingQueryKey(config);
  const devicesQueryKey = useMemo(
    () => ['bedroom-devices', baseUrl, mappingKey] as const,
    [baseUrl, mappingKey],
  );
  const [pendingDeviceId, setPendingDeviceId] = useState<string>();

  const query = useQuery({
    queryKey: devicesQueryKey,
    enabled: Boolean(
      pollingEnabled && haReady && entityIds.length > 0,
    ),
    staleTime: BEDROOM_DEVICES_STALE_MS,
    refetchInterval: pollingEnabled ? BEDROOM_DEVICES_STALE_MS : false,
    queryFn: async () => {
      const states = await fetchEntityStates(haBaseUrl, haToken, entityIds);
      return mapBedroomDevices(states, config);
    },
  });

  const runAction = useCallback(
    async (deviceId: string, action: TBedroomDeviceAction): Promise<boolean> => {
      if (!haReady) return false;
      setPendingDeviceId(deviceId);
      try {
        await setBedroomDevice(deviceId, action, haBaseUrl, haToken, config);
        await queryClient.invalidateQueries({
          queryKey: devicesQueryKey,
        });
        return true;
      } catch {
        // entity может отсутствовать в HA
        return false;
      } finally {
        setPendingDeviceId(undefined);
      }
    },
    [haReady, haBaseUrl, haToken, queryClient, devicesQueryKey, config],
  );

  const setSlider = useCallback(
    async (deviceId: string, value: number) => {
      return runAction(deviceId, { kind: 'slider', value });
    },
    [runAction],
  );

  const setToggle = useCallback(
    async (deviceId: string, isOn: boolean) => {
      return runAction(deviceId, { kind: 'toggle', isOn });
    },
    [runAction],
  );

  const setSegment = useCallback(
    async (deviceId: string, optionId: string) => {
      return runAction(deviceId, { kind: 'segment', optionId });
    },
    [runAction],
  );

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: devicesQueryKey,
    });
  }, [queryClient, devicesQueryKey]);

  return {
    devices: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    isRefreshing: query.isFetching && !query.isPending,
    pendingDeviceId,
    setSlider,
    setToggle,
    setSegment,
    refresh,
  };
}
