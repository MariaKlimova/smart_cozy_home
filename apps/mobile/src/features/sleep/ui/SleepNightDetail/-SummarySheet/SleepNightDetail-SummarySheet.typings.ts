import type { ISleepNightMetricItem } from '@/features/sleep/lib/formatSleepNightSummary';
import type { ISleepNightSummary, TSleepNightScore } from '@/domain/sleepNight.typings';

export interface ISleepNightDetailSummarySheetProps {
  /** Видимость шторы */
  visible: boolean;
  /** Заголовок шторы */
  title: string;
  /** Сводка по ночи */
  night: ISleepNightSummary;
  /** Итоговая оценка */
  score: TSleepNightScore;
  /** Сводные метрики */
  metrics: ISleepNightMetricItem[];
  /** Закрыть штору */
  onClose: () => void;
}
