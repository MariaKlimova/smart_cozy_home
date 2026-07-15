import type { IBedroomDeviceUserConfig } from '@/config/bedroomDeviceSlotMapping.typings';
import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import type { IHaEntityState } from '@/ha/types';

/** State entity считается недоступным для автофолбека */
export function isHaEntityUnavailable(state: string | undefined): boolean {
  if (state === undefined) return true;
  return state === 'unavailable' || state === 'unknown' || state === '';
}

/**
 * Кандидаты entity_id увлажнителя: ручной override слота или primary → fallback.
 */
export function getHumidifierEntityCandidates(
  config: IBedroomDeviceUserConfig | null,
): string[] {
  const custom = config?.entities?.humidifier;
  if (typeof custom === 'string' && custom.length > 0) {
    return [custom];
  }
  return [HA_ENTITIES.devices.humidifier, HA_ENTITIES.devices.humidifierFallback];
}

/**
 * Выбирает доступный увлажнитель: primary, иначе fallback.
 * Если никто не доступен — возвращает первого кандидата (обычно primary).
 */
export function pickHumidifierEntityId(
  candidates: string[],
  getState: (entityId: string) => string | undefined,
): string {
  for (const entityId of candidates) {
    if (!isHaEntityUnavailable(getState(entityId))) {
      return entityId;
    }
  }
  return candidates[0] ?? HA_ENTITIES.devices.humidifier;
}

/** То же, что {@link pickHumidifierEntityId}, по списку IHaEntityState */
export function pickHumidifierEntityIdFromStates(
  candidates: string[],
  states: IHaEntityState[],
): string {
  const byId = new Map(states.map((s) => [s.entityId, s.state]));
  return pickHumidifierEntityId(candidates, (entityId) => byId.get(entityId));
}
