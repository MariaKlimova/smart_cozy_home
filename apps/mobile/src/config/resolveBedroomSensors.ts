import type { IBedroomSensorMapping } from '@/config/bedroomSensorMapping.typings';
import { HOME_CONFIG } from '@/config/homeConfig';
import type { IBedroomSensorsMapping } from '@/config/homeConfig.typings';
import { MOCK_BEDROOM_SENSOR_MAPPING } from '@/config/scenarioMocks';
import { USE_HA_MOCKS } from '@/ha/haClient';

function resolveSlot(
  override: string | null | undefined,
  defaultEntity: string,
): string | null {
  if (override === null) return null;
  if (typeof override === 'string' && override.length > 0) return override;
  if (override === undefined) return defaultEntity;
  return null;
}

/** Дефолты из homeConfig + пользовательские overrides */
export function resolveBedroomSensors(
  overrides: IBedroomSensorMapping | null,
): IBedroomSensorsMapping {
  const defaults = HOME_CONFIG.bedroom_sensors;
  const effectiveOverrides = USE_HA_MOCKS ? MOCK_BEDROOM_SENSOR_MAPPING : overrides;

  return {
    temperature: {
      entity: resolveSlot(effectiveOverrides?.temperature, defaults.temperature.entity) ?? '',
    },
    humidity: {
      entity: resolveSlot(effectiveOverrides?.humidity, defaults.humidity.entity) ?? '',
    },
    co2: {
      entity: resolveSlot(effectiveOverrides?.co2, defaults.co2.entity) ?? '',
    },
    pressure: {
      entity: resolveSlot(effectiveOverrides?.pressure, defaults.pressure.entity) ?? '',
    },
  };
}

/** Активные entity_id для запроса в HA */
export function getActiveBedroomSensorEntityIds(mapping: IBedroomSensorsMapping): string[] {
  const ids = [
    mapping.temperature.entity,
    mapping.humidity.entity,
    mapping.co2.entity,
    mapping.pressure.entity,
  ].filter((id) => id.length > 0);

  return [...new Set(ids)];
}

/** Стабильный ключ для React Query */
export function bedroomSensorMappingQueryKey(overrides: IBedroomSensorMapping | null): string {
  if (!overrides) return 'default';
  return JSON.stringify(overrides);
}
