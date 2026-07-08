import type { TSleepMetricId } from '@/domain/sleepMetricNorms';
import type { ISleepSensorSample } from '@/domain/sleepNight.typings';

/** Значение метрики из точки показаний */
export function getSleepMetricValue(
  sample: ISleepSensorSample,
  metricId: TSleepMetricId,
): number | undefined {
  if (metricId === 'co2') {
    return sample.co2Ppm;
  }
  if (metricId === 'temperature') {
    return sample.temperatureC;
  }
  return sample.humidityPct;
}
