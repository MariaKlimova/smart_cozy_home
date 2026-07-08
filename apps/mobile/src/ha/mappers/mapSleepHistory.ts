import type { ISleepSensorSample } from '@/domain/sleepNight.typings';

import type { IHaHistoryState } from '@/ha/haHistory.typings';

export interface IMapSleepHistoryEntityIds {
  /** entity_id CO₂ */
  co2: string;
  /** entity_id температуры */
  temperature: string;
  /** entity_id влажности */
  humidity: string;
}

function parseNumericState(state: string): number | undefined {
  if (state === 'unavailable' || state === 'unknown') {
    return undefined;
  }
  const value = Number.parseFloat(state);
  if (Number.isNaN(value)) {
    return undefined;
  }
  return value;
}

function flattenHistory(
  rawHistory: IHaHistoryState[][],
  entityIds: IMapSleepHistoryEntityIds,
): { timestamp: Date; entityKey: keyof IMapSleepHistoryEntityIds; value: number }[] {
  const entityKeyById = new Map<string, keyof IMapSleepHistoryEntityIds>([
    [entityIds.co2, 'co2'],
    [entityIds.temperature, 'temperature'],
    [entityIds.humidity, 'humidity'],
  ]);

  const points: { timestamp: Date; entityKey: keyof IMapSleepHistoryEntityIds; value: number }[] =
    [];

  for (const entityHistory of rawHistory) {
    for (const entry of entityHistory) {
      const entityKey = entityKeyById.get(entry.entity_id);
      const value = parseNumericState(entry.state);
      if (!entityKey || value === undefined) {
        continue;
      }
      points.push({
        timestamp: new Date(entry.last_changed),
        entityKey,
        value,
      });
    }
  }

  return points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/** Объединяет history HA в единую временную серию показаний */
export function mapSleepHistory(
  rawHistory: IHaHistoryState[][],
  entityIds: IMapSleepHistoryEntityIds,
): ISleepSensorSample[] {
  const points = flattenHistory(rawHistory, entityIds);
  if (points.length === 0) {
    return [];
  }

  const latestValues: Partial<Record<keyof IMapSleepHistoryEntityIds, number>> = {};
  const samples: ISleepSensorSample[] = [];

  for (const point of points) {
    latestValues[point.entityKey] = point.value;
    samples.push({
      timestamp: point.timestamp,
      co2Ppm: latestValues.co2,
      temperatureC: latestValues.temperature,
      humidityPct: latestValues.humidity,
    });
  }

  return samples;
}
