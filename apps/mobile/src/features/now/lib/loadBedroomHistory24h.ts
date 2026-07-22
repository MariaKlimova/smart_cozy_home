import type { ISleepSensorSample } from '@/domain/sleepNight.typings';
import { sliceSamplesToRange } from '@/features/sleep/lib/sliceSamplesToRange';
import { fetchHistoryPeriod, USE_HA_MOCKS } from '@/ha/haClient';
import {
  generateMockBedroomHistory24h,
  waitForMockBedroomHistory24h,
} from '@/ha/mockBedroomHistory24h';
import { mapSleepHistory } from '@/ha/mappers/mapSleepHistory';

/** Длительность окна истории на «Сейчас», мс */
export const BEDROOM_HISTORY_24H_MS = 24 * 60 * 60 * 1000;

export interface ILoadBedroomHistory24hParams {
  /** baseUrl HA */
  baseUrl: string;
  /** token HA */
  token: string;
  /** Конец окна (обычно сейчас) */
  endAt: Date;
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

export interface IBedroomHistory24hResult {
  /** Точки за окно */
  samples: ISleepSensorSample[];
  /** Начало окна */
  startAt: Date;
  /** Конец окна */
  endAt: Date;
}

/** Загружает time-series датчиков за последние 24 часа */
export async function loadBedroomHistory24h(
  params: ILoadBedroomHistory24hParams,
): Promise<IBedroomHistory24hResult> {
  const { baseUrl, token, endAt, sensorEntityIds } = params;
  const startAt = new Date(endAt.getTime() - BEDROOM_HISTORY_24H_MS);

  if (USE_HA_MOCKS) {
    await waitForMockBedroomHistory24h();
    const rawHistory = generateMockBedroomHistory24h({ startAt, sensorEntityIds });
    const mappedSamples = mapSleepHistory(rawHistory, sensorEntityIds);
    return {
      samples: sliceSamplesToRange(mappedSamples, startAt, endAt),
      startAt,
      endAt,
    };
  }

  const sensorIds = [
    sensorEntityIds.co2,
    sensorEntityIds.temperature,
    sensorEntityIds.humidity,
  ].filter((id) => id.length > 0);

  const rawHistory = await fetchHistoryPeriod(baseUrl, token, sensorIds, startAt, endAt);
  const mappedSamples = mapSleepHistory(rawHistory, sensorEntityIds);

  return {
    samples: sliceSamplesToRange(mappedSamples, startAt, endAt),
    startAt,
    endAt,
  };
}
