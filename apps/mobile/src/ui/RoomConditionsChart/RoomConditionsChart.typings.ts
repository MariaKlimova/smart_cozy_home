import type { ReactNode } from 'react';

import type { TSleepMetricId } from '@/domain/sleepMetricNorms';
import type { ISleepSensorSample } from '@/domain/sleepNight.typings';

/** Временное окно графика условий */
export interface IRoomConditionsRange {
  /** Начало окна */
  startAt: Date;
  /** Конец окна */
  endAt: Date;
}

export interface IRoomConditionsChartProps {
  /** Точки показаний датчиков */
  samples: ISleepSensorSample[];
  /** Границы оси X графика */
  range: IRoomConditionsRange;
  /** Заголовок секции */
  title: string;
  /** Сообщение при отсутствии данных */
  emptyMessage: string;
  /** Подпись периода под заголовком */
  subtitle?: string;
  /** Insight над segmented; строка или функция от активной метрики */
  insight?: string | ((metricId: TSleepMetricId) => string);
  /** Доп. контент под графиком (например «Подробнее») */
  footer?: ReactNode;
  /** Показать скелетон вместо графика */
  isLoading?: boolean;
  /** Показывать полосу нормы и зоны отклонений на графике */
  showNormBand?: boolean;
}
