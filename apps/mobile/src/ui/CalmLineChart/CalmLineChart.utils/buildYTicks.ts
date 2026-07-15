export interface ICalmLineChartBuildYTicksParams {
  /** Минимум домена оси Y */
  min: number;
  /** Максимум домена оси Y */
  max: number;
  /** Число подписей, включая min и max */
  count: number;
}

/** Равномерные значения оси Y сверху вниз (max → min) */
export function buildYTicks(params: ICalmLineChartBuildYTicksParams): number[] {
  const { min, max, count } = params;

  if (count < 2) {
    return [max];
  }

  if (max === min) {
    return [max];
  }

  const steps = count - 1;
  const ticks: number[] = [];

  for (let index = 0; index <= steps; index += 1) {
    const ratio = index / steps;
    ticks.push(max - (max - min) * ratio);
  }

  return ticks;
}
