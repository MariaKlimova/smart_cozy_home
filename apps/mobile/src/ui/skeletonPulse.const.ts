/** Минимальная opacity пульса скелетона */
export const SKELETON_PULSE_OPACITY_MIN = 0.35;

/** Параметры пульса скелетона сетки недели */
export const WEEK_GRID_SKELETON_PULSE = {
  /** Максимальная opacity */
  max: 1,
  /** Длительность полупериода, мс */
  durationMs: 650,
} as const;

/** Параметры пульса скелетона деталей ночи */
export const SLEEP_NIGHT_DETAIL_SKELETON_PULSE = {
  /** Максимальная opacity */
  max: 0.7,
  /** Длительность полупериода, мс */
  durationMs: 900,
} as const;
