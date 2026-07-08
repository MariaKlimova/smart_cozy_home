import type { ISleepNightSummary } from '@/domain/sleepNight.typings';

export interface ISleepNightDetailProps {
  /** Выбранная ночь */
  night: ISleepNightSummary;
  /** Смещение недели */
  weekOffset: number;
}
