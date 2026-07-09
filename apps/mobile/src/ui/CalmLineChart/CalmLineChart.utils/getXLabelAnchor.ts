export interface ICalmLineChartGetXLabelAnchorParams {
  /** Индекс подписи в массиве */
  index: number;
  /** Общее число подписей */
  total: number;
}

/** Возвращает выравнивание подписи оси X */
export function getXLabelAnchor(
  params: ICalmLineChartGetXLabelAnchorParams,
): 'start' | 'middle' | 'end' {
  const { index, total } = params;

  if (index === 0) {
    return 'start';
  }
  if (index === total - 1) {
    return 'end';
  }

  return 'middle';
}
