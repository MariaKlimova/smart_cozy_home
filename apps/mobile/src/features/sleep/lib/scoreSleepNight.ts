import type {
  ISleepNightSummary,
  ISleepNightWindow,
  ISleepSensorSample,
  TSleepNightIssueKey,
  TSleepNightScore,
} from '@/domain/sleepNight.typings';
import {
  SLEEP_CO2_DEVIATION_MIN_MS,
  SLEEP_CO2_NORM_MAX_PPM,
  SLEEP_HUMIDITY_DEVIATION_MIN_MS,
  SLEEP_HUMIDITY_NORM_MIN_PCT,
  SLEEP_TEMP_NORM_MAX_C,
  SLEEP_TEMP_NORM_MIN_C,
} from '@/domain/sleepMetricNorms';

import { accumulateSampleDurationMs } from './accumulateSampleDuration';
import { sliceNightSamples } from './sliceNightSamples';

function hasSensorData(samples: ISleepSensorSample[]): boolean {
  return samples.some(
    (sample) =>
      sample.co2Ppm !== undefined ||
      sample.temperatureC !== undefined ||
      sample.humidityPct !== undefined,
  );
}

function hasInstantCondition(
  samples: ISleepSensorSample[],
  matches: (sample: ISleepSensorSample) => boolean,
): boolean {
  return samples.some(matches);
}

function collectDeviations(samples: ISleepSensorSample[], endAt: Date): TSleepNightIssueKey[] {
  const issues: TSleepNightIssueKey[] = [];

  const co2Duration = accumulateSampleDurationMs(
    samples,
    endAt,
    (sample) => sample.co2Ppm !== undefined && sample.co2Ppm >= SLEEP_CO2_NORM_MAX_PPM,
  );
  if (co2Duration > SLEEP_CO2_DEVIATION_MIN_MS) {
    issues.push('co2High');
  }

  const humidityDuration = accumulateSampleDurationMs(
    samples,
    endAt,
    (sample) =>
      sample.humidityPct !== undefined && sample.humidityPct < SLEEP_HUMIDITY_NORM_MIN_PCT,
  );
  if (humidityDuration > SLEEP_HUMIDITY_DEVIATION_MIN_MS) {
    issues.push('humidityLow');
  }

  const tempHigh = hasInstantCondition(
    samples,
    (sample) => sample.temperatureC !== undefined && sample.temperatureC > SLEEP_TEMP_NORM_MAX_C,
  );
  if (tempHigh) {
    issues.push('tempHigh');
  }

  const tempLow = hasInstantCondition(
    samples,
    (sample) => sample.temperatureC !== undefined && sample.temperatureC < SLEEP_TEMP_NORM_MIN_C,
  );
  if (tempLow) {
    issues.push('tempLow');
  }

  return issues;
}

function scoreFromIssues(issueCount: number): TSleepNightScore {
  if (issueCount === 0) {
    return 'good';
  }
  if (issueCount === 1) {
    return 'fair';
  }
  return 'poor';
}

function computeCo2Range(samples: ISleepSensorSample[]): { min?: number; max?: number } {
  const values = samples
    .map((sample) => sample.co2Ppm)
    .filter((value): value is number => value !== undefined);

  if (values.length === 0) {
    return {};
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function computeTempAverage(samples: ISleepSensorSample[]): number | undefined {
  const values = samples
    .map((sample) => sample.temperatureC)
    .filter((value): value is number => value !== undefined);

  if (values.length === 0) {
    return undefined;
  }

  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function computeHumidityAverage(samples: ISleepSensorSample[]): number | undefined {
  const values = samples
    .map((sample) => sample.humidityPct)
    .filter((value): value is number => value !== undefined);

  if (values.length === 0) {
    return undefined;
  }

  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

/** Оценивает качество среды за одну ночь */
export function scoreSleepNight(
  window: ISleepNightWindow,
  samples: ISleepSensorSample[],
): ISleepNightSummary {
  const nightSamples = sliceNightSamples(samples, window);
  const sensorData = hasSensorData(nightSamples);
  const hasData = sensorData;

  if (!hasData) {
    return {
      window,
      score: 'no_data',
      issues: [],
      hasData: false,
    };
  }

  const issues = collectDeviations(nightSamples, window.endAt);
  const co2Range = computeCo2Range(nightSamples);

  return {
    window,
    score: scoreFromIssues(issues.length),
    co2MinPpm: co2Range.min,
    co2MaxPpm: co2Range.max,
    tempAvgC: computeTempAverage(nightSamples),
    humidityAvgPct: computeHumidityAverage(nightSamples),
    issues,
    hasData: true,
  };
}
