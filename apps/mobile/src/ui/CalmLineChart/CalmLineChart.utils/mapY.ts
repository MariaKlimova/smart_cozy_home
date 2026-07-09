export interface ICalmLineChartMapYParams {
  /** Значение метрики по Y */
  value: number;
  /** Минимум домена оси Y */
  yDomainMin: number;
  /** Максимум домена оси Y */
  yDomainMax: number;
  /** Верхний край области построения, px */
  plotTop: number;
  /** Высота области построения, px */
  chartHeight: number;
}

/** Преобразует значение метрики в координату Y SVG */
export function mapY(params: ICalmLineChartMapYParams): number {
  const { value, yDomainMin, yDomainMax, plotTop, chartHeight } = params;
  const range = yDomainMax - yDomainMin;

  if (range === 0) {
    return plotTop + chartHeight / 2;
  }

  const ratio = (value - yDomainMin) / range;
  return plotTop + chartHeight - ratio * chartHeight;
}
