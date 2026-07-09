import type { ICalmLineChartPoint } from '../CalmLineChart.typings';

import { mapX } from './mapX';
import { mapY } from './mapY';

export interface ICalmLineChartBuildLinePathParams {
  /** Точки линии */
  points: ICalmLineChartPoint[];
  /** Левый край области построения, px */
  plotLeft: number;
  /** Ширина области построения, px */
  chartWidth: number;
  /** Верхний край области построения, px */
  plotTop: number;
  /** Высота области построения, px */
  chartHeight: number;
  /** Минимум домена оси Y */
  yDomainMin: number;
  /** Максимум домена оси Y */
  yDomainMax: number;
}

/** Строит SVG path для линии графика */
export function buildLinePath(params: ICalmLineChartBuildLinePathParams): string {
  const {
    points,
    plotLeft,
    chartWidth,
    plotTop,
    chartHeight,
    yDomainMin,
    yDomainMax,
  } = params;

  if (points.length === 0) {
    return '';
  }

  return points
    .map((point, index) => {
      const x = mapX({ normalizedX: point.x, plotLeft, chartWidth });
      const y = mapY({ value: point.y, yDomainMin, yDomainMax, plotTop, chartHeight });
      const command = index === 0 ? 'M' : 'L';
      return `${command}${x},${y}`;
    })
    .join(' ');
}
