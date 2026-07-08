import {
  SKELETON_PULSE_OPACITY_MIN,
  WEEK_GRID_SKELETON_PULSE,
} from '@/ui/skeletonPulse.const';

/** testID скелетона сетки недели */
export const WEEK_GRID_SKELETON = 'WeekGridSkeleton' as const;

/** Количество ячеек в скелетоне */
export const WEEK_GRID_SKELETON_CELL_COUNT = 7;

/** Минимальная opacity пульса скелетона */
export const WEEK_GRID_SKELETON_PULSE_MIN = SKELETON_PULSE_OPACITY_MIN;

/** Максимальная opacity пульса скелетона */
export const WEEK_GRID_SKELETON_PULSE_MAX = WEEK_GRID_SKELETON_PULSE.max;

/** Длительность полупериода пульса, мс */
export const WEEK_GRID_SKELETON_PULSE_MS = WEEK_GRID_SKELETON_PULSE.durationMs;
