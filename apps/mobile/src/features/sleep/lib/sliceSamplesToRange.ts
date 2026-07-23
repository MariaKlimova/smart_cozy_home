import type { ISleepSensorSample } from '@/domain/sleepNight.typings';

/** Оставляет точки датчиков внутри [startAt, endAt], по возрастанию времени */
export function sliceSamplesToRange(
  samples: ISleepSensorSample[],
  startAt: Date,
  endAt: Date,
): ISleepSensorSample[] {
  const startMs = startAt.getTime();
  const endMs = endAt.getTime();

  return samples
    .filter((sample) => {
      const time = sample.timestamp.getTime();
      return time >= startMs && time <= endMs;
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
