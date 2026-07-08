import { getWeekEndForOffset } from '@/domain/sleepNightWindows';
import type { ISleepNightWindow, ISleepSensorSample } from '@/domain/sleepNight.typings';
import { fetchHistoryPeriod, USE_HA_MOCKS } from '@/ha/haClient';
import { generateMockSleepHistoryWeek, waitForMockSleepHistory } from '@/ha/mockSleepHistory';
import { mapSleepHistory } from '@/ha/mappers/mapSleepHistory';

import { sliceNightSamples } from './sliceNightSamples';

export interface ILoadSleepNightSamplesParams {
  /** baseUrl HA */
  baseUrl: string;
  /** token HA */
  token: string;
  /** Окно ночи */
  nightWindow: ISleepNightWindow;
  /** Смещение недели */
  weekOffset: number;
  /** entity_id датчиков */
  sensorEntityIds: {
    co2: string;
    temperature: string;
    humidity: string;
  };
}

/** Загружает time-series датчиков только для одной ночи */
export async function loadSleepNightSamples(
  params: ILoadSleepNightSamplesParams,
): Promise<ISleepSensorSample[]> {
  const { baseUrl, token, nightWindow, weekOffset, sensorEntityIds } = params;

  if (USE_HA_MOCKS) {
    await waitForMockSleepHistory();
    const weekEnd = getWeekEndForOffset(weekOffset);
    const mappedSamples = mapSleepHistory(
      generateMockSleepHistoryWeek(weekEnd, weekOffset).history,
      sensorEntityIds,
    );
    return sliceNightSamples(mappedSamples, nightWindow);
  }

  const sensorIds = [
    sensorEntityIds.co2,
    sensorEntityIds.temperature,
    sensorEntityIds.humidity,
  ].filter((id) => id.length > 0);

  const rawHistory = await fetchHistoryPeriod(
    baseUrl,
    token,
    sensorIds,
    nightWindow.startAt,
    nightWindow.endAt,
  );

  const mappedSamples = mapSleepHistory(rawHistory, sensorEntityIds);
  return sliceNightSamples(mappedSamples, nightWindow);
}
