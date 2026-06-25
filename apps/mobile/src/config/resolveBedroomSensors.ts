import type { IBedroomSensorMapping } from '@/config/bedroomSensorMapping.typings';
import { RITUALS_CONFIG, type IBedroomSensorsMapping } from '@/config/ritualsConfig';

function resolveSlot(
  override: string | null | undefined,
  defaultEntity: string,
): string | null {
  if (override === null) return null;
  if (typeof override === 'string' && override.length > 0) return override;
  if (override === undefined) return defaultEntity;
  return null;
}

/** Дефолты из ritualsConfig + пользовательские overrides */
export function resolveBedroomSensors(
  overrides: IBedroomSensorMapping | null,
): IBedroomSensorsMapping {
  const defaults = RITUALS_CONFIG.bedroom_sensors;

  return {
    temperature: {
      entity: resolveSlot(overrides?.temperature, defaults.temperature.entity) ?? '',
    },
    humidity: {
      entity: resolveSlot(overrides?.humidity, defaults.humidity.entity) ?? '',
    },
    co2: {
      entity: resolveSlot(overrides?.co2, defaults.co2.entity) ?? '',
    },
  };
}

/** Активные entity_id для запроса в HA */
export function getActiveBedroomSensorEntityIds(mapping: IBedroomSensorsMapping): string[] {
  const ids = [
    mapping.temperature.entity,
    mapping.humidity.entity,
    mapping.co2.entity,
  ].filter((id) => id.length > 0);

  return [...new Set(ids)];
}

/** Стабильный ключ для React Query */
export function bedroomSensorMappingQueryKey(overrides: IBedroomSensorMapping | null): string {
  if (!overrides) return 'default';
  return JSON.stringify(overrides);
}
