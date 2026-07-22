import type { IHaHistoryState } from '@/ha/haHistory.typings';

const MOCK_24H_DELAY_MS = 600;

/** Часовые смещения точек мок-истории за сутки */
const MOCK_24H_HOUR_OFFSETS = [
  0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 23.5,
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function buildHistoryState(entityId: string, state: string, lastChanged: Date): IHaHistoryState {
  return {
    entity_id: entityId,
    state,
    last_changed: lastChanged.toISOString(),
  };
}

export interface IMockBedroomHistory24hParams {
  /** Начало окна */
  startAt: Date;
  /** entity_id датчиков */
  sensorEntityIds: {
    /** CO₂ */
    co2: string;
    /** Температура */
    temperature: string;
    /** Влажность */
    humidity: string;
  };
}

/** Синтетика history за 24 часа для мок-режима */
export function generateMockBedroomHistory24h(
  params: IMockBedroomHistory24hParams,
): IHaHistoryState[][] {
  const { startAt, sensorEntityIds } = params;
  const byEntity = new Map<string, IHaHistoryState[]>([
    [sensorEntityIds.co2, []],
    [sensorEntityIds.temperature, []],
    [sensorEntityIds.humidity, []],
  ]);

  for (const hourOffset of MOCK_24H_HOUR_OFFSETS) {
    const at = addHours(startAt, hourOffset);
    const co2 = 650 + hourOffset * 18 + (hourOffset % 3) * 25;
    const temperature = 20.5 + Math.sin(hourOffset / 4) * 1.2;
    const humidity = 42 + (hourOffset % 5) * 2;

    if (sensorEntityIds.co2) {
      byEntity.get(sensorEntityIds.co2)?.push(buildHistoryState(sensorEntityIds.co2, String(co2), at));
    }
    if (sensorEntityIds.temperature) {
      byEntity
        .get(sensorEntityIds.temperature)
        ?.push(buildHistoryState(sensorEntityIds.temperature, String(temperature.toFixed(1)), at));
    }
    if (sensorEntityIds.humidity) {
      byEntity
        .get(sensorEntityIds.humidity)
        ?.push(buildHistoryState(sensorEntityIds.humidity, String(humidity), at));
    }
  }

  return [
    byEntity.get(sensorEntityIds.co2) ?? [],
    byEntity.get(sensorEntityIds.temperature) ?? [],
    byEntity.get(sensorEntityIds.humidity) ?? [],
  ];
}

/** Мок-задержка для скелетона графика 24h */
export async function waitForMockBedroomHistory24h(): Promise<void> {
  await delay(MOCK_24H_DELAY_MS);
}
