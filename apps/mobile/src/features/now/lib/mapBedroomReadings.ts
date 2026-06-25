import type { IBedroomSensorsMapping } from '@/config/homeConfig.typings';
import type { IHaEntityState } from '@/ha/types';

import type { IBedroomReadings } from './bedroomReadings.typings';

function parseNumericState(state: IHaEntityState | undefined): number | undefined {
  if (!state || state.state === 'unavailable' || state.state === 'unknown') {
    return undefined;
  }
  const value = Number.parseFloat(state.state);
  if (Number.isNaN(value)) return undefined;
  return value;
}

/** Собирает показания спальни из стейтов HA по резолвленному маппингу */
export function mapBedroomReadings(
  states: IHaEntityState[],
  sensors: IBedroomSensorsMapping,
): IBedroomReadings {
  const byId = new Map(states.map((s) => [s.entityId, s]));

  const co2Entity = sensors.co2.entity;
  const tempEntity = sensors.temperature.entity;
  const humidityEntity = sensors.humidity.entity;

  return {
    co2Ppm: co2Entity ? parseNumericState(byId.get(co2Entity)) : undefined,
    temperatureC: tempEntity ? parseNumericState(byId.get(tempEntity)) : undefined,
    humidityPct: humidityEntity ? parseNumericState(byId.get(humidityEntity)) : undefined,
  };
}
