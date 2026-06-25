import type { IBedroomMetricView } from '@/features/now/lib/interpretState';

/** Пропсы ряда метрик */
export interface IBedroomStateCardMetricsProps {
  /** Три метрики: температура, влажность, воздух */
  metrics: IBedroomMetricView[];
}
