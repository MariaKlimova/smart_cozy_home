import type { IMetricChipView } from '@/features/now/lib/interpretState';

/** Пропсы ряда метрик */
export interface IBedroomStateCardMetricsProps {
  /** Заголовок блока (опционально) */
  sectionTitle?: string;
  /** Метрики для чипов в ряд */
  metrics: IMetricChipView[];
}
