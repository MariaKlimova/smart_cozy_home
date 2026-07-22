import type { ISleepNightWindow, ISleepSensorSample } from '@/domain/sleepNight.typings';

import { sliceSamplesToRange } from './sliceSamplesToRange';

/** Оставляет точки датчиков внутри окна ночи */
export function sliceNightSamples(
  samples: ISleepSensorSample[],
  window: ISleepNightWindow,
): ISleepSensorSample[] {
  return sliceSamplesToRange(samples, window.startAt, window.endAt);
}
