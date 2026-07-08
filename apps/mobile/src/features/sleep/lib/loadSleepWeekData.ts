import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import {
  getSleepLogbookRange,
  getWeekEndForOffset,
  resolveNightWindows,
} from '@/domain/sleepNightWindows';
import type { ISleepNightSummary } from '@/domain/sleepNight.typings';
import { fetchHistoryPeriod, fetchLogbookRange, USE_HA_MOCKS } from '@/ha/haClient';
import { generateMockSleepHistoryWeek, waitForMockSleepHistory } from '@/ha/mockSleepHistory';
import { mapSleepHistory } from '@/ha/mappers/mapSleepHistory';

import { scoreSleepNight } from './scoreSleepNight';

export interface ILoadSleepWeekDataParams {
  /** baseUrl HA */
  baseUrl: string;
  /** token HA */
  token: string;
  /** Смещение недели */
  weekOffset: number;
  /** entity_id датчиков */
  sensorEntityIds: {
    co2: string;
    temperature: string;
    humidity: string;
  };
}

/** Загружает и оценивает одну неделю сна */
export async function loadSleepWeekData(
  params: ILoadSleepWeekDataParams,
): Promise<{ weekEnd: Date; nights: ISleepNightSummary[] }> {
  const { baseUrl, token, weekOffset, sensorEntityIds } = params;
  if (USE_HA_MOCKS) {
    await waitForMockSleepHistory();
  }

  const weekEnd = getWeekEndForOffset(weekOffset);
  const logbookRange = getSleepLogbookRange(weekEnd);
  const scriptEntityIds = [HA_ENTITIES.scripts.evening, HA_ENTITIES.scripts.morning];
  const mockWeek = USE_HA_MOCKS ? generateMockSleepHistoryWeek(weekEnd, weekOffset) : null;

  const logbookEntries = mockWeek
    ? mockWeek.logbook
    : (
        await fetchLogbookRange(
          baseUrl,
          token,
          scriptEntityIds,
          logbookRange.start,
          logbookRange.end,
        )
      ).map((entry) => ({
        when: entry.when,
        scriptId: entry.entity_id,
      }));

  const windows = resolveNightWindows({
    weekEnd,
    logbookEntries,
    eveningEntityId: HA_ENTITIES.scripts.evening,
    morningEntityId: HA_ENTITIES.scripts.morning,
  });

  if (windows.length === 0) {
    return { weekEnd, nights: [] };
  }

  const historyStart = windows.reduce(
    (earliest, window) =>
      window.startAt.getTime() < earliest.getTime() ? window.startAt : earliest,
    windows[0].startAt,
  );
  const historyEnd = windows.reduce(
    (latest, window) => (window.endAt.getTime() > latest.getTime() ? window.endAt : latest),
    windows[0].endAt,
  );

  const sensorIds = [
    sensorEntityIds.co2,
    sensorEntityIds.temperature,
    sensorEntityIds.humidity,
  ].filter((id) => id.length > 0);

  const rawHistory = mockWeek
    ? mockWeek.history
    : await fetchHistoryPeriod(baseUrl, token, sensorIds, historyStart, historyEnd);

  const samples = mapSleepHistory(rawHistory, sensorEntityIds);
  const nights = windows.map((window) => scoreSleepNight(window, samples));

  return { weekEnd, nights };
}
