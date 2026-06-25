import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { bedroomDeviceMappingQueryKey, getActiveBedroomDeviceEntityIds, resolveBedroomDevices } from '@/config/resolveBedroomDevices';
import type { TBedroomDeviceAction } from '@/domain/bedroomDeviceAction.typings';
import type { IBedroomDeviceState } from '@/domain/bedroomDevice.typings';
import { setBedroomDevice } from '@/domain/bedroomDeviceControl';
import { fetchEntityStates } from '@/ha/haClient';
import { mapBedroomDevices } from '@/ha/mappers/domainMapper';
import { useBedroomDeviceStore } from '@/store/bedroomDeviceStore';
import { useConnectionStore } from '@/store/connectionStore';

const BEDROOM_DEVICES_STALE_MS = 30_000;

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
  /** Установить значение slider */
  setSlider: (deviceId: string, value: number) => Promise<void>;
  /** Переключить toggle */
  setToggle: (deviceId: string, isOn: boolean) => Promise<void>;
  /** Выбрать сегмент */
  setSegment: (deviceId: string, optionId: string) => Promise<void>;
  /** Обновить состояния */
  refresh: () => Promise<void>;
}

/** Загрузка и управление устройствами спальни через HA */
export function useBedroomControls(): IUseBedroomControlsResult {
  const queryClient = useQueryClient();
  const isConnected = useConnectionStore((s) => s.isConnected);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const token = useConnectionStore((s) => s.profile?.accessToken);
  const config = useBedroomDeviceStore((s) => s.config);
  const entityIds = useMemo(
    () => getActiveBedroomDeviceEntityIds(resolveBedroomDevices(config)),
    [config],
  );
  const mappingKey = bedroomDeviceMappingQueryKey(config);
  const [pendingDeviceId, setPendingDeviceId] = useState<string>();

  const query = useQuery({
    queryKey: ['bedroom-devices', baseUrl, mappingKey],
    enabled: Boolean(isConnected && baseUrl && token && entityIds.length > 0),
    staleTime: BEDROOM_DEVICES_STALE_MS,
    refetchInterval: BEDROOM_DEVICES_STALE_MS,
    queryFn: async () => {
      const states = await fetchEntityStates(baseUrl!, token!, entityIds);
      return mapBedroomDevices(states, config);
    },
  });

  const runAction = useCallback(
    async (deviceId: string, action: TBedroomDeviceAction) => {
      if (!baseUrl || !token) return;
      setPendingDeviceId(deviceId);
      try {
        await setBedroomDevice(deviceId, action, baseUrl, token, config);
        await queryClient.invalidateQueries({
          queryKey: ['bedroom-devices', baseUrl, mappingKey],
        });
      } catch {
        // entity может отсутствовать в HA
      } finally {
        setPendingDeviceId(undefined);
      }
    },
    [baseUrl, token, queryClient, mappingKey, config],
  );

  const setSlider = useCallback(
    async (deviceId: string, value: number) => {
      await runAction(deviceId, { kind: 'slider', value });
    },
    [runAction],
  );

  const setToggle = useCallback(
    async (deviceId: string, isOn: boolean) => {
      await runAction(deviceId, { kind: 'toggle', isOn });
    },
    [runAction],
  );

  const setSegment = useCallback(
    async (deviceId: string, optionId: string) => {
      await runAction(deviceId, { kind: 'segment', optionId });
    },
    [runAction],
  );

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['bedroom-devices', baseUrl, mappingKey],
    });
  }, [queryClient, baseUrl, mappingKey]);

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
