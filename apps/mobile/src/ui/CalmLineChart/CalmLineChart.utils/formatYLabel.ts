export interface ICalmLineChartFormatYLabelParams {
  /** Значение подписи */
  value: number;
  /** Единица измерения */
  unit: string;
}

/** Форматирует подпись значения на оси Y */
export function formatYLabel(params: ICalmLineChartFormatYLabelParams): string {
  const { value, unit } = params;
  const rounded = String(Math.round(value));

  if (unit === '°C') {
    return `${rounded}°`;
  }
  if (unit === '%') {
    return `${rounded}%`;
  }

  return rounded;
}
