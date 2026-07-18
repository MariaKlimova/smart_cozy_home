import type { IBedroomDeviceUserConfig } from '@/config/bedroomDeviceSlotMapping.typings';
import { resolveBedroomDevices } from '@/config/resolveBedroomDevices';
import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import {
  clampVisibleMin,
  mapDeviceToLogicalPct,
  mapLogicalToDevicePct,
  readVisibleMin,
} from '@/domain/lightBrightnessScale';
import { fetchEntityStates, setLightBrightness, setNumberValue } from '@/ha/haClient';
import type { IHaEntityState } from '@/ha/types';

/**
 * Если свет включён — логическая яркость, которую нужно сохранить после смены floor.
 * Выкл / нет яркости → null (железо не трогаем).
 */
export function resolveLogicalBrightnessToKeep(
  lightState: IHaEntityState | undefined,
  previousFloor: number,
): number | null {
  if (!lightState || lightState.state === 'off') {
    return null;
  }
  if (lightState.state === 'unavailable' || lightState.state === 'unknown') {
    return null;
  }
  const brightness = lightState.attributes?.brightness;
  if (typeof brightness !== 'number' || brightness <= 0) {
    return null;
  }
  const devicePct = Math.round((brightness / 255) * 100);
  return mapDeviceToLogicalPct(devicePct, previousFloor);
}

/** Записать порог «свет виден с» и пересчитать железо под текущую логическую яркость */
export async function setBedroomLightVisibleMin(
  value: number,
  baseUrl: string,
  token: string,
  config: IBedroomDeviceUserConfig | null = null,
): Promise<void> {
  const nextFloor = clampVisibleMin(value);
  const mapping = resolveBedroomDevices(config).find((d) => d.id === 'light');
  if (!mapping) {
    throw new Error('Unknown bedroom device: light');
  }
  const states = await fetchEntityStates(baseUrl, token, [
    mapping.entity,
    HA_ENTITIES.devices.lightVisibleMin,
  ]);
  const previousFloor = readVisibleMin(
    HA_ENTITIES.devices.lightVisibleMin,
    (entityId) => states.find((s) => s.entityId === entityId)?.state,
  );
  const lightState = states.find((s) => s.entityId === mapping.entity);
  const logicalToKeep = resolveLogicalBrightnessToKeep(lightState, previousFloor);

  await setNumberValue(baseUrl, token, HA_ENTITIES.devices.lightVisibleMin, nextFloor);

  if (logicalToKeep === null || logicalToKeep <= 0) {
    return;
  }

  const devicePct = mapLogicalToDevicePct(logicalToKeep, nextFloor);
  await setLightBrightness(baseUrl, token, mapping.entity, devicePct);
}
