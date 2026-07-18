import {
  SLEEP_SCORE_EFFICIENCY_CEILING,
  SLEEP_SCORE_EFFICIENCY_FLOOR,
} from '@/health/sleepScore.const';
import { lerpClamped } from '@/health/sleepScoreMath';

/** Efficiency score 0–100; null если нет валидного time in bed */
export function computeEfficiencyScore(
  totalSleepMinutes: number,
  timeInBedMinutes: number | undefined,
): number | null {
  if (timeInBedMinutes === undefined || timeInBedMinutes <= 0) {
    return null;
  }
  if (totalSleepMinutes <= 0) {
    return 0;
  }

  const efficiency = Math.min(1, totalSleepMinutes / timeInBedMinutes);

  if (efficiency < SLEEP_SCORE_EFFICIENCY_FLOOR) {
    return 0;
  }
  if (efficiency >= SLEEP_SCORE_EFFICIENCY_CEILING) {
    return 100;
  }

  return Math.round(
    lerpClamped(
      efficiency,
      SLEEP_SCORE_EFFICIENCY_FLOOR,
      SLEEP_SCORE_EFFICIENCY_CEILING,
      0,
      100,
    ),
  );
}
