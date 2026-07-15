import type {
  IBedroomDeviceUserConfig,
  TBedroomDeviceSlot,
} from '@/config/bedroomDeviceSlotMapping.typings';
import {
  getHumidifierEntityCandidates,
  pickHumidifierEntityIdFromStates,
} from '@/config/humidifierEntity';
import { HOME_CONFIG } from '@/config/homeConfig';
import type { IBedroomDeviceMapping } from '@/config/homeConfig.typings';
import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import { USE_HA_MOCKS } from '@/ha/haClient';
import type { IHaEntityState } from '@/ha/types';

const MOCK_BEDROOM_ENTITY_IDS = new Set<string>([
  HA_ENTITIES.devices.light,
  HA_ENTITIES.devices.curtains,
  HA_ENTITIES.devices.window,
  HA_ENTITIES.devices.airConditioner,
  HA_ENTITIES.devices.ventilation,
  HA_ENTITIES.devices.radiator,
  HA_ENTITIES.devices.humidifier,
  HA_ENTITIES.devices.humidifierFallback,
  HA_ENTITIES.devices.co2,
  HA_ENTITIES.devices.temperature,
  HA_ENTITIES.devices.humidity,
  HA_ENTITIES.devices.pressure,
  HA_ENTITIES.devices.outdoorTemperature,
  HA_ENTITIES.devices.occupancy,
]);

function applyMockEntityGuard(candidate: string, defaultEntity: string): string {
  if (!USE_HA_MOCKS) return candidate;
  if (MOCK_BEDROOM_ENTITY_IDS.has(candidate)) return candidate;
  return defaultEntity;
}

function resolveBedroomEntity(
  slot: TBedroomDeviceSlot,
  defaultEntity: string,
  config: IBedroomDeviceUserConfig | null,
  states: IHaEntityState[] | null,
): string {
  const customEntity = config?.entities?.[slot];
  if (typeof customEntity === 'string' && customEntity.length > 0) {
    return applyMockEntityGuard(customEntity, defaultEntity);
  }

  if (slot === 'humidifier') {
    const candidates = getHumidifierEntityCandidates(config);
    if (states) {
      return pickHumidifierEntityIdFromStates(candidates, states);
    }
    return candidates[0] ?? defaultEntity;
  }

  return applyMockEntityGuard(defaultEntity, defaultEntity);
}

/** Опции резолва устройств спальни */
export interface IResolveBedroomDevicesOptions {
  /**
   * Состояния HA для автофолбека увлажнителя (primary → switch).
   * Без states выбирается primary / override.
   */
  states?: IHaEntityState[] | null;
}

/** Дефолты из homeConfig + пользовательская конфигурация */
export function resolveBedroomDevices(
  config: IBedroomDeviceUserConfig | null,
  options?: IResolveBedroomDevicesOptions,
): IBedroomDeviceMapping[] {
  const defaults = HOME_CONFIG.bedroom_devices.devices;
  const hidden = new Set(config?.hiddenSlots ?? []);
  const states = options?.states ?? null;

  return defaults
    .map((device) => {
      const slot = device.id as TBedroomDeviceSlot;
      if (hidden.has(slot)) return null;
      const entity = resolveBedroomEntity(slot, device.entity, config, states);
      if (!entity) return null;
      return { ...device, entity };
    })
    .filter((device): device is IBedroomDeviceMapping => device !== null);
}

/**
 * Entity_id для запроса/подписки в HA: для увлажнителя без override —
 * оба кандидата (primary + fallback).
 */
export function getActiveBedroomDeviceEntityIds(
  config: IBedroomDeviceUserConfig | null,
): string[] {
  const devices = resolveBedroomDevices(config);
  const ids: string[] = [];

  for (const device of devices) {
    if (device.id === 'humidifier') {
      ids.push(...getHumidifierEntityCandidates(config));
      continue;
    }
    if (device.entity.length > 0) {
      ids.push(device.entity);
    }
  }

  return [...new Set(ids)];
}

/** Стабильный ключ для React Query */
export function bedroomDeviceMappingQueryKey(config: IBedroomDeviceUserConfig | null): string {
  if (!config) return 'default';
  return JSON.stringify(config);
}
