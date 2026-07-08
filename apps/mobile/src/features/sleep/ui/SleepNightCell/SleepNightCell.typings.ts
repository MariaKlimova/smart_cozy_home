import type { ISleepNightSummary } from '@/domain/sleepNight.typings';

export interface ISleepNightCellProps {
  /** Сводка по ночи */
  night: ISleepNightSummary;
  /** Тап по ячейке */
  onPress: (night: ISleepNightSummary) => void;
  /** Ячейка выбрана */
  selected?: boolean;
}
