import type { ISleepSensorSample } from '@/domain/sleepNight.typings';

/** Суммирует длительность интервалов, где sample удовлетворяет условию */
export function accumulateSampleDurationMs(
  samples: ISleepSensorSample[],
  endAt: Date,
  matches: (sample: ISleepSensorSample) => boolean,
): number {
  if (samples.length === 0) {
    return 0;
  }

  let totalMs = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index];
    if (!matches(sample)) {
      continue;
    }

    const startMs = sample.timestamp.getTime();
    const nextSample = samples[index + 1];
    const endMs = nextSample ? nextSample.timestamp.getTime() : endAt.getTime();
    totalMs += Math.max(0, endMs - startMs);
  }

  return totalMs;
}
