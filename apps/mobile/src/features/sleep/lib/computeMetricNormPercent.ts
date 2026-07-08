import type { TSleepMetricId } from '@/domain/sleepMetricNorms';
import {
  SLEEP_CO2_NORM_MAX_PPM,
  SLEEP_HUMIDITY_NORM_MIN_PCT,
  SLEEP_TEMP_NORM_MAX_C,
  SLEEP_TEMP_NORM_MIN_C,
} from '@/domain/sleepMetricNorms';
import type { ISleepNightWindow, ISleepSensorSample } from '@/domain/sleepNight.typings';

import { accumulateSampleDurationMs } from './accumulateSampleDuration';
import { getSleepMetricValue } from './getSleepMetricValue';

function isMetricInNorm(value: number, metricId: TSleepMetricId): boolean {
  if (metricId === 'co2') {
    return value < SLEEP_CO2_NORM_MAX_PPM;
  }
  if (metricId === 'temperature') {
    return value >= SLEEP_TEMP_NORM_MIN_C && value <= SLEEP_TEMP_NORM_MAX_C;
  }
  return value >= SLEEP_HUMIDITY_NORM_MIN_PCT;
}

function hasMetricSamples(samples: ISleepSensorSample[], metricId: TSleepMetricId): boolean {
  return samples.some((sample) => getSleepMetricValue(sample, metricId) !== undefined);
}

/** Доля времени ночи, когда метрика была в норме (0–100), или null если нет точек */
export function computeMetricNormPercent(
  samples: ISleepSensorSample[],
  window: ISleepNightWindow,
  metricId: TSleepMetricId,
): number | null {
  if (!hasMetricSamples(samples, metricId)) {
    return null;
  }

  const nightDurationMs = Math.max(0, window.endAt.getTime() - window.startAt.getTime());
  if (nightDurationMs === 0) {
    return null;
  }

  const inNormMs = accumulateSampleDurationMs(samples, window.endAt, (sample) => {
    const value = getSleepMetricValue(sample, metricId);
    if (value === undefined) {
      return false;
    }
    return isMetricInNorm(value, metricId);
  });

  return Math.round((inNormMs / nightDurationMs) * 100);
}
