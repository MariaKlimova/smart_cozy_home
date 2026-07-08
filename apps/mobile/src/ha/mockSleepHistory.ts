import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import type { ISleepLogbookEntry, ISleepSensorSample } from '@/domain/sleepNight.typings';
import { resolveNightWindows } from '@/domain/sleepNightWindows';
import type { IHaHistoryState } from '@/ha/haHistory.typings';

type TMockNightProfile = 'good' | 'fairCo2' | 'fairTemp' | 'poor' | 'noScenario' | 'fairHumidity';

const MOCK_PROFILES: TMockNightProfile[] = [
  'good',
  'fairCo2',
  'fairTemp',
  'poor',
  'noScenario',
  'good',
  'fairHumidity',
];

/** Задержка мок-загрузки, чтобы был виден скелетон */
const MOCK_SLEEP_HISTORY_DELAY_MS = 800;

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

function profileForNight(weekOffset: number, nightIndex: number): TMockNightProfile {
  const profileIndex = (nightIndex + weekOffset * 3) % MOCK_PROFILES.length;
  return MOCK_PROFILES[profileIndex] ?? 'good';
}

/** Часы от начала ночи для мок-точек (каждый час) */
const MOCK_NIGHT_HOUR_OFFSETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 8.5];

function buildSamplesAtHours(
  startAt: Date,
  hourOffsets: number[],
  buildSample: (hourOffset: number) => Partial<ISleepSensorSample>,
): ISleepSensorSample[] {
  return hourOffsets.map((hourOffset) => ({
    timestamp: addHours(startAt, hourOffset),
    ...buildSample(hourOffset),
  }));
}

function buildGoodNightSamples(startAt: Date, weekOffset: number): ISleepSensorSample[] {
  const co2Base = 620 + weekOffset * 20;

  return buildSamplesAtHours(startAt, MOCK_NIGHT_HOUR_OFFSETS, (hourOffset) => ({
    co2Ppm: co2Base + hourOffset * 12 + (hourOffset % 2) * 8,
    temperatureC: 18 - weekOffset * 0.3 + (hourOffset % 4) * 0.25,
    humidityPct: 48 + (hourOffset % 3) * 2,
  }));
}

function buildFairCo2Samples(startAt: Date, weekOffset: number): ISleepSensorSample[] {
  const spike = 1050 + weekOffset * 25;

  return buildSamplesAtHours(startAt, MOCK_NIGHT_HOUR_OFFSETS, (hourOffset) => {
    const isSpike = hourOffset >= 1 && hourOffset <= 4;
    let co2Ppm = 680 + hourOffset * 10;
    if (isSpike) {
      co2Ppm = spike + (hourOffset - 1) * 35;
    }

    return {
      co2Ppm,
      temperatureC: 18,
      humidityPct: 50,
    };
  });
}

function buildFairTempSamples(startAt: Date, weekOffset: number): ISleepSensorSample[] {
  const cold = 15 - weekOffset * 0.5;

  return buildSamplesAtHours(startAt, MOCK_NIGHT_HOUR_OFFSETS, (hourOffset) => ({
    co2Ppm: 700 + hourOffset * 5,
    temperatureC: hourOffset <= 5 ? cold + hourOffset * 0.15 : 17 + hourOffset * 0.1,
    humidityPct: 50,
  }));
}

function buildPoorSamples(startAt: Date, weekOffset: number): ISleepSensorSample[] {
  const hot = 23 + weekOffset * 0.4;

  return buildSamplesAtHours(startAt, MOCK_NIGHT_HOUR_OFFSETS, (hourOffset) => ({
    co2Ppm: 1180 + weekOffset * 10 + hourOffset * 15,
    temperatureC: hot + hourOffset * 0.08,
    humidityPct: 50,
  }));
}

function buildFairHumiditySamples(startAt: Date, weekOffset: number): ISleepSensorSample[] {
  const dry = 25 - weekOffset;

  return buildSamplesAtHours(startAt, MOCK_NIGHT_HOUR_OFFSETS, (hourOffset) => ({
    co2Ppm: 700 + hourOffset * 4,
    temperatureC: 18,
    humidityPct: hourOffset <= 4 ? dry - hourOffset * 0.5 : 42 + hourOffset,
  }));
}

function buildSamplesForProfile(
  profile: TMockNightProfile,
  startAt: Date,
  weekOffset: number,
): ISleepSensorSample[] {
  if (profile === 'noScenario') {
    return [];
  }
  if (profile === 'fairCo2') {
    return buildFairCo2Samples(startAt, weekOffset);
  }
  if (profile === 'fairTemp') {
    return buildFairTempSamples(startAt, weekOffset);
  }
  if (profile === 'poor') {
    return buildPoorSamples(startAt, weekOffset);
  }
  if (profile === 'fairHumidity') {
    return buildFairHumiditySamples(startAt, weekOffset);
  }
  return buildGoodNightSamples(startAt, weekOffset);
}

function samplesToHistory(
  samples: ISleepSensorSample[],
  entityIds: { co2: string; temperature: string; humidity: string },
): IHaHistoryState[] {
  const history: IHaHistoryState[] = [];

  for (const sample of samples) {
    if (sample.co2Ppm !== undefined) {
      history.push(buildHistoryState(entityIds.co2, String(sample.co2Ppm), sample.timestamp));
    }
    if (sample.temperatureC !== undefined) {
      history.push(
        buildHistoryState(entityIds.temperature, String(sample.temperatureC), sample.timestamp),
      );
    }
    if (sample.humidityPct !== undefined) {
      history.push(
        buildHistoryState(entityIds.humidity, String(sample.humidityPct), sample.timestamp),
      );
    }
  }

  return history.sort(
    (a, b) => new Date(a.last_changed).getTime() - new Date(b.last_changed).getTime(),
  );
}

export interface IMockSleepHistoryWeek {
  /** Записи logbook */
  logbook: ISleepLogbookEntry[];
  /** History API: массив массивов по entity */
  history: IHaHistoryState[][];
}

/** Синтетика за неделю для мок-режима */
export function generateMockSleepHistoryWeek(weekEnd: Date, weekOffset = 0): IMockSleepHistoryWeek {
  const windows = resolveNightWindows({
    weekEnd,
    logbookEntries: [],
    eveningEntityId: HA_ENTITIES.scripts.evening,
    morningEntityId: HA_ENTITIES.scripts.morning,
  });

  const entityIds = {
    co2: HA_ENTITIES.devices.co2,
    temperature: HA_ENTITIES.devices.temperature,
    humidity: HA_ENTITIES.devices.humidity,
  };

  const logbook: ISleepLogbookEntry[] = [];
  const flatHistory: IHaHistoryState[] = [];

  windows.forEach((window, index) => {
    const profile = profileForNight(weekOffset, index);
    if (profile !== 'noScenario') {
      logbook.push({
        when: window.startAt.toISOString(),
        scriptId: HA_ENTITIES.scripts.evening,
      });
      logbook.push({
        when: window.endAt.toISOString(),
        scriptId: HA_ENTITIES.scripts.morning,
      });
    }

    const samples = buildSamplesForProfile(profile, window.startAt, weekOffset);
    flatHistory.push(...samplesToHistory(samples, entityIds));
  });

  const historyByEntity = new Map<string, IHaHistoryState[]>();
  for (const state of flatHistory) {
    const bucket = historyByEntity.get(state.entity_id) ?? [];
    bucket.push(state);
    historyByEntity.set(state.entity_id, bucket);
  }

  const history = [entityIds.co2, entityIds.temperature, entityIds.humidity].map(
    (entityId) => historyByEntity.get(entityId) ?? [],
  );

  return { logbook, history };
}

/** Мок-задержка для демонстрации скелетона */
export async function waitForMockSleepHistory(): Promise<void> {
  await delay(MOCK_SLEEP_HISTORY_DELAY_MS);
}
