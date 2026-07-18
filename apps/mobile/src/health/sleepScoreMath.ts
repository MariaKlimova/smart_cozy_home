/** Линейная интерполяция x из [x0,x1] в [y0,y1]; вне диапазона — clamp по концам */
export function lerpClamped(
  value: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
): number {
  if (x1 === x0) {
    return y0;
  }
  if (value <= x0) {
    return y0;
  }
  if (value >= x1) {
    return y1;
  }
  const t = (value - x0) / (x1 - x0);
  return y0 + t * (y1 - y0);
}

/** Округление score 0–100 до целого */
export function clampScore(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

/** Медиана чисел; пустой массив → undefined */
export function median(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/** Выборочное стандартное отклонение; меньше 2 точек → 0 */
export function sampleStdDev(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}
