import type { IBedroomSensorsMapping } from '@/config/homeConfig.typings';
import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import type { IHaEntityState } from '@/ha/types';

import type { IBedroomReadings } from './bedroomReadings.typings';
import { parseSunEventFromHaState } from './parseSunEvent';
import { parseWeatherConditionFromHaState } from './parseWeatherCondition';

function parseNumericState(state: IHaEntityState | undefined): number | undefined {
  if (!state || state.state === 'unavailable' || state.state === 'unknown') {
    return undefined;
  }
  const value = Number.parseFloat(state.state);
  if (Number.isNaN(value)) return undefined;
  return value;
}

function parseNumericAttribute(
  state: IHaEntityState | undefined,
  attributeKey: string,
): number | undefined {
  if (!state || state.state === 'unavailable' || state.state === 'unknown') {
    return undefined;
  }
  const raw = state.attributes?.[attributeKey];
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    const value = Number.parseFloat(raw);
    if (Number.isNaN(value)) return undefined;
    return value;
  }
  return undefined;
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
  const pressureEntity = sensors.pressure.entity;
  const outdoorWeather = byId.get(HA_ENTITIES.devices.outdoorTemperature);

  return {
    co2Ppm: co2Entity ? parseNumericState(byId.get(co2Entity)) : undefined,
    temperatureC: tempEntity ? parseNumericState(byId.get(tempEntity)) : undefined,
    humidityPct: humidityEntity ? parseNumericState(byId.get(humidityEntity)) : undefined,
    pressureMmhg: pressureEntity ? parseNumericState(byId.get(pressureEntity)) : undefined,
    outdoorTemperatureC: parseNumericAttribute(outdoorWeather, 'temperature'),
    outdoorWeatherCondition: parseWeatherConditionFromHaState(outdoorWeather),
    sunEvent: parseSunEventFromHaState(byId.get(HA_ENTITIES.system.sun)),
  };
}
