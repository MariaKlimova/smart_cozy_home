import type { ISleepNightWindow, ISleepSensorSample } from '@/domain/sleepNight.typings';

/** Оставляет точки датчиков внутри окна ночи */
export function sliceNightSamples(
  samples: ISleepSensorSample[],
  window: ISleepNightWindow,
): ISleepSensorSample[] {
  const startMs = window.startAt.getTime();
  const endMs = window.endAt.getTime();

  return samples
    .filter((sample) => {
      const time = sample.timestamp.getTime();
      return time >= startMs && time <= endMs;
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
