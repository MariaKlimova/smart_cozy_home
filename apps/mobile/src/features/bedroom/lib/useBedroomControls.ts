import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import {
  bedroomDeviceMappingQueryKey,
  getActiveBedroomDeviceEntityIds,
  resolveBedroomDevices,
} from '@/config/resolveBedroomDevices';
import type { TBedroomDeviceAction } from '@/domain/bedroomDeviceAction.typings';
import type { IBedroomDeviceState } from '@/domain/bedroomDevice.typings';
import { setBedroomDevice, setBedroomLightVisibleMin } from '@/domain/bedroomDeviceControl';
import {
  clampVisibleMin,
} from '@/domain/lightBrightnessScale';
import { fetchHaLightFavoriteColors } from '@/ha/entityRegistry';
import { fetchEntityStates } from '@/ha/haClient';
import { mapBedroomDevices, mapHaLightPresetsToDomain } from '@/ha/mappers/domainMapper';
import { useHaBackend } from '@/ha/useHaBackend';
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
  /** Установить яркость и цвет ночника; false — команда не применилась */
  setColorLight: (
    deviceId: string,
    brightness: number,
    colorPresetId: string,
  ) => Promise<boolean>;
  /** Порог «свет виден с» для основного света; false — не применилось */
  setLightVisibleMin: (value: number) => Promise<boolean>;
  /** Обновить состояния */
  refresh: () => Promise<void>;
}

type TDevicesQueryKey = readonly ['bedroom-devices', string | null, string];

function patchToggleInCache(
  devices: IBedroomDeviceState[] | undefined,
  deviceId: string,
  isOn: boolean,
): IBedroomDeviceState[] | undefined {
  if (!devices) return devices;
  return devices.map((device) => {
    if (device.id !== deviceId) return device;
    return { ...device, value: { isOn } };
  });
}

function patchColorLightInCache(
  devices: IBedroomDeviceState[] | undefined,
  deviceId: string,
  brightness: number,
  colorPresetId: string,
): IBedroomDeviceState[] | undefined {
  if (!devices) return devices;
  return devices.map((device) => {
    if (device.id !== deviceId) return device;
    if (!device.value || !('colorPresets' in device.value)) return device;
    return {
      ...device,
      value: {
        ...device.value,
        brightness,
        colorPresetId,
      },
    };
  });
}

function patchSliderInCache(
  devices: IBedroomDeviceState[] | undefined,
  deviceId: string,
  current: number,
): IBedroomDeviceState[] | undefined {
  if (!devices) return devices;
  return devices.map((device) => {
    if (device.id !== deviceId) return device;
    if (!device.value || !('current' in device.value)) return device;
    return {
      ...device,
      value: {
        ...device.value,
        current,
      },
    };
  });
}

function patchSliderVisibleMinInCache(
  devices: IBedroomDeviceState[] | undefined,
  visibleMin: number,
): IBedroomDeviceState[] | undefined {
  if (!devices) return devices;
  return devices.map((device) => {
    if (device.id !== 'light') return device;
    if (!device.value || !('current' in device.value)) return device;
    return {
      ...device,
      value: {
        ...device.value,
        visibleMin,
      },
    };
  });
}

/**
 * REST /api/states часто отстаёт от call_service — сразу возвращаем optimistic
 * и после soft-refresh снова накладываем patch, чтобы refetch не затирал UI.
 */
function commitOptimisticAndSoftRefresh(
  queryClient: QueryClient,
  devicesQueryKey: TDevicesQueryKey,
  previousDevices: IBedroomDeviceState[] | undefined,
  patch: (devices: IBedroomDeviceState[] | undefined) => IBedroomDeviceState[] | undefined,
): void {
  queryClient.setQueryData(
    devicesQueryKey,
    patch(queryClient.getQueryData<IBedroomDeviceState[]>(devicesQueryKey) ?? previousDevices),
  );
  void queryClient.invalidateQueries({ queryKey: devicesQueryKey }).then(() => {
    queryClient.setQueryData(
      devicesQueryKey,
      (current: IBedroomDeviceState[] | undefined) => {
        const patched = patch(current);
        return patched ?? current;
      },
    );
  });
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
  const resolvedDevices = useMemo(() => resolveBedroomDevices(config), [config]);
  const entityIds = useMemo(() => getActiveBedroomDeviceEntityIds(config), [config]);
  const nightlightEntity = useMemo(
    () =>
      resolvedDevices.find(
        (device) => device.id === 'nightlight' && device.control === 'color_light',
      ),
    [resolvedDevices],
  );
  const mappingKey = bedroomDeviceMappingQueryKey(config);
  const devicesQueryKey = useMemo(
    () => ['bedroom-devices', baseUrl, mappingKey] as const,
    [baseUrl, mappingKey],
  );
  const [pendingDeviceId, setPendingDeviceId] = useState<string>();

  const query = useQuery({
    queryKey: devicesQueryKey,
    enabled: Boolean(pollingEnabled && haReady && entityIds.length > 0),
    staleTime: BEDROOM_DEVICES_STALE_MS,
    refetchInterval: pollingEnabled ? BEDROOM_DEVICES_STALE_MS : false,
    queryFn: async () => {
      const states = await fetchEntityStates(haBaseUrl, haToken, entityIds);
      const presetsMap: Record<string, ReturnType<typeof mapHaLightPresetsToDomain>> = {};

      if (nightlightEntity) {
        const nightlightState = states.find((s) => s.entityId === nightlightEntity.entity);
        const haPresets = await fetchHaLightFavoriteColors(
          haBaseUrl,
          haToken,
          nightlightEntity.entity,
          nightlightState?.attributes,
        );
        presetsMap.nightlight = mapHaLightPresetsToDomain(haPresets);
      }

      return mapBedroomDevices(states, config, presetsMap);
    },
  });

  const runAction = useCallback(
    async (deviceId: string, action: TBedroomDeviceAction): Promise<boolean> => {
      if (!haReady) return false;
      setPendingDeviceId(deviceId);

      const previousDevices = queryClient.getQueryData<IBedroomDeviceState[]>(devicesQueryKey);
      if (action.kind === 'toggle') {
        queryClient.setQueryData(
          devicesQueryKey,
          patchToggleInCache(previousDevices, deviceId, action.isOn),
        );
      } else if (action.kind === 'color_light') {
        queryClient.setQueryData(
          devicesQueryKey,
          patchColorLightInCache(
            previousDevices,
            deviceId,
            action.brightness,
            action.colorPresetId,
          ),
        );
      } else if (action.kind === 'slider') {
        queryClient.setQueryData(
          devicesQueryKey,
          patchSliderInCache(previousDevices, deviceId, action.value),
        );
      }

      try {
        await setBedroomDevice(deviceId, action, haBaseUrl, haToken, config);

        if (action.kind === 'toggle') {
          commitOptimisticAndSoftRefresh(
            queryClient,
            devicesQueryKey,
            previousDevices,
            (devices) => patchToggleInCache(devices, deviceId, action.isOn),
          );
          return true;
        }

        if (action.kind === 'color_light') {
          commitOptimisticAndSoftRefresh(
            queryClient,
            devicesQueryKey,
            previousDevices,
            (devices) =>
              patchColorLightInCache(devices, deviceId, action.brightness, action.colorPresetId),
          );
          return true;
        }

        if (action.kind === 'slider') {
          commitOptimisticAndSoftRefresh(
            queryClient,
            devicesQueryKey,
            previousDevices,
            (devices) => patchSliderInCache(devices, deviceId, action.value),
          );
          return true;
        }

        await queryClient.invalidateQueries({
          queryKey: devicesQueryKey,
        });
        return true;
      } catch {
        if (previousDevices) {
          queryClient.setQueryData(devicesQueryKey, previousDevices);
        }
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

  const setColorLight = useCallback(
    async (deviceId: string, brightness: number, colorPresetId: string) => {
      const device = query.data?.find((item) => item.id === deviceId);
      const value =
        device?.value && 'colorPresets' in device.value ? device.value : undefined;
      const preset = value?.colorPresets.find((item) => item.id === colorPresetId);
      if (!preset) {
        return false;
      }
      return runAction(deviceId, {
        kind: 'color_light',
        brightness,
        colorPresetId,
        color: preset.color,
      });
    },
    [query.data, runAction],
  );

  const setLightVisibleMin = useCallback(
    async (value: number) => {
      if (!haReady) return false;
      const next = clampVisibleMin(value);
      setPendingDeviceId('light');
      const previousDevices = queryClient.getQueryData<IBedroomDeviceState[]>(devicesQueryKey);
      queryClient.setQueryData(
        devicesQueryKey,
        patchSliderVisibleMinInCache(previousDevices, next),
      );
      try {
        await setBedroomLightVisibleMin(next, haBaseUrl, haToken, config);
        commitOptimisticAndSoftRefresh(
          queryClient,
          devicesQueryKey,
          previousDevices,
          (devices) => patchSliderVisibleMinInCache(devices, next),
        );
        return true;
      } catch {
        if (previousDevices) {
          queryClient.setQueryData(devicesQueryKey, previousDevices);
        }
        return false;
      } finally {
        setPendingDeviceId(undefined);
      }
    },
    [haReady, haBaseUrl, haToken, queryClient, devicesQueryKey, config],
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
    setColorLight,
    setLightVisibleMin,
    refresh,
  };
}
