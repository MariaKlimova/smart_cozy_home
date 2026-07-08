import type { TSleepMetricId } from '@/domain/sleepMetricNorms';
import {
  SLEEP_CO2_NORM_MAX_PPM,
  SLEEP_METRIC_CHART_SCALES,
  SLEEP_METRIC_NORMS,
} from '@/domain/sleepMetricNorms';
import type { ISleepNightWindow, ISleepSensorSample } from '@/domain/sleepNight.typings';
import type {
  ICalmLineChartPoint,
  ICalmLineChartNormBand,
  ICalmLineChartXLabel,
  ICalmLineChartYDomain,
} from '@/ui/CalmLineChart';

import { getSleepMetricValue } from './getSleepMetricValue';

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/** Строит точки графика для метрики за ночь */
export function buildSleepMetricChartPoints(
  samples: ISleepSensorSample[],
  window: ISleepNightWindow,
  metricId: TSleepMetricId,
): ICalmLineChartPoint[] {
  const startMs = window.startAt.getTime();
  const endMs = window.endAt.getTime();
  const durationMs = Math.max(endMs - startMs, 1);

  return samples
    .map((sample) => {
      const value = getSleepMetricValue(sample, metricId);
      if (value === undefined) {
        return null;
      }

      const x = (sample.timestamp.getTime() - startMs) / durationMs;
      return { x: Math.max(0, Math.min(1, x)), y: value };
    })
    .filter((point): point is ICalmLineChartPoint => point !== null);
}

/** Подписи оси X: начало, середина и конец ночи */
export function buildSleepNightXLabels(window: ISleepNightWindow): ICalmLineChartXLabel[] {
  const midMs = window.startAt.getTime() + (window.endAt.getTime() - window.startAt.getTime()) / 2;

  return [
    { x: 0, label: formatTimeLabel(window.startAt) },
    { x: 0.5, label: formatTimeLabel(new Date(midMs)) },
    { x: 1, label: formatTimeLabel(window.endAt) },
  ];
}

/** Домен оси Y: дефолтная шкала, расширяется только при выходе данных за неё */
export function buildSleepMetricYDomain(
  points: ICalmLineChartPoint[],
  metricId: TSleepMetricId,
): ICalmLineChartYDomain {
  const scale = SLEEP_METRIC_CHART_SCALES[metricId];
  const values = points.map((point) => point.y);

  if (values.length === 0) {
    return {
      min: scale.defaultMin,
      max: scale.defaultMax,
    };
  }

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  return {
    min: Math.min(scale.defaultMin, dataMin - scale.edgePadding),
    max: Math.max(scale.defaultMax, dataMax + scale.edgePadding),
  };
}

/** Полоса нормы и зоны отклонений для графика */
export function buildSleepMetricNormBand(metricId: TSleepMetricId): ICalmLineChartNormBand {
  if (metricId === 'co2') {
    return {
      max: SLEEP_CO2_NORM_MAX_PPM,
      highlightAboveMax: true,
      highlightBelowMin: false,
    };
  }

  if (metricId === 'temperature') {
    const norm = SLEEP_METRIC_NORMS.temperature;
    return {
      min: norm.min,
      max: norm.max,
      highlightAboveMax: true,
      highlightBelowMin: true,
    };
  }

  const norm = SLEEP_METRIC_NORMS.humidity;
  return {
    min: norm.min,
    highlightAboveMax: false,
    highlightBelowMin: true,
  };
}

/** Единица измерения метрики */
export function getSleepMetricUnit(metricId: TSleepMetricId): string {
  return SLEEP_METRIC_NORMS[metricId].unit;
}
