/** Точка линии графика */
export interface ICalmLineChartPoint {
  /** Нормализованная позиция по X (0–1) */
  x: number;
  /** Значение метрики по Y */
  y: number;
}

/** Подпись оси X */
export interface ICalmLineChartXLabel {
  /** Нормализованная позиция (0–1) */
  x: number;
  /** Текст подписи */
  label: string;
}

/** Полоса нормы на графике */
export interface ICalmLineChartNormBand {
  /** Нижняя граница нормы */
  min?: number;
  /** Верхняя граница нормы */
  max?: number;
  /** Подсветить зону выше max как отклонение */
  highlightAboveMax?: boolean;
  /** Подсветить зону ниже min как отклонение */
  highlightBelowMin?: boolean;
}

/** Домен оси Y */
export interface ICalmLineChartYDomain {
  /** Минимум */
  min: number;
  /** Максимум */
  max: number;
}

export interface ICalmLineChartProps {
  /** Точки линии */
  points: ICalmLineChartPoint[];
  /** Полоса нормы */
  normBand?: ICalmLineChartNormBand;
  /** Домен оси Y */
  yDomain: ICalmLineChartYDomain;
  /** Подписи оси X */
  xLabels: ICalmLineChartXLabel[];
  /** Единица измерения */
  unit: string;
  /** Высота графика, px */
  height?: number;
  /** Сообщение при отсутствии данных */
  emptyMessage?: string;
}
