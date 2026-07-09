export interface ICalmLineChartMapXParams {
  /** Нормализованная позиция по X (0–1) */
  normalizedX: number;
  /** Левый край области построения, px */
  plotLeft: number;
  /** Ширина области построения, px */
  chartWidth: number;
}

/** Преобразует нормализованную X в координату SVG */
export function mapX(params: ICalmLineChartMapXParams): number {
  const { normalizedX, plotLeft, chartWidth } = params;
  return plotLeft + normalizedX * chartWidth;
}
