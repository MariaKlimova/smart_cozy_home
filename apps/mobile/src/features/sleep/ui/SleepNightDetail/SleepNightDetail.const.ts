export const SLEEP_NIGHT_DETAIL = 'SleepNightDetail' as const;

/** Расширение зоны нажатия кнопки «Подробнее» без увеличения строки */
export const SLEEP_NIGHT_DETAIL_DETAILS_HIT_SLOP = {
  top: 14,
  bottom: 14,
  left: 8,
  right: 8,
} as const;

export const SLEEP_NIGHT_DETAIL_METRIC_OPTIONS = [
  { id: 'co2' as const, labelKey: 'co2' as const },
  { id: 'temperature' as const, labelKey: 'temperature' as const },
  { id: 'humidity' as const, labelKey: 'humidity' as const },
];
