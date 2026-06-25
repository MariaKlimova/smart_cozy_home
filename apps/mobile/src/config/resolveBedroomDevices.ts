import type {
  IBedroomDeviceUserConfig,
  TBedroomDeviceSlot,
} from '@/config/bedroomDeviceSlotMapping.typings';
import { HOME_CONFIG } from '@/config/homeConfig';
import type { IBedroomDeviceMapping } from '@/config/homeConfig.typings';

/** Дефолты из homeConfig + пользовательская конфигурация */
export function resolveBedroomDevices(
  config: IBedroomDeviceUserConfig | null,
): IBedroomDeviceMapping[] {
  const defaults = HOME_CONFIG.bedroom_devices.devices;
  const hidden = new Set(config?.hiddenSlots ?? []);

  return defaults
    .map((device) => {
      const slot = device.id as TBedroomDeviceSlot;
      if (hidden.has(slot)) return null;
      const entity = config?.entities?.[slot] ?? device.entity;
      if (!entity) return null;
      return { ...device, entity };
    })
    .filter((device): device is IBedroomDeviceMapping => device !== null);
}

/** Активные entity_id для запроса в HA */
export function getActiveBedroomDeviceEntityIds(devices: IBedroomDeviceMapping[]): string[] {
  const ids = devices.map((d) => d.entity).filter((id) => id.length > 0);
  return [...new Set(ids)];
}

/** Стабильный ключ для React Query */
export function bedroomDeviceMappingQueryKey(config: IBedroomDeviceUserConfig | null): string {
  if (!config) return 'default';
  return JSON.stringify(config);
}
