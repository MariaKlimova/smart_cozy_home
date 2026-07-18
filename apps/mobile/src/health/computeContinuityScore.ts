import {
  SLEEP_SCORE_AWAKENINGS_GOOD_MAX,
  SLEEP_SCORE_AWAKENINGS_POOR_MIN,
  SLEEP_SCORE_WASO_GOOD_MAX,
  SLEEP_SCORE_WASO_POOR_MIN,
} from '@/health/sleepScore.const';
import { lerpClamped } from '@/health/sleepScoreMath';

function scoreFromRange(
  value: number,
  goodMax: number,
  poorMin: number,
): number {
  if (value <= goodMax) {
    return 100;
  }
  if (value >= poorMin) {
    return 0;
  }
  return lerpClamped(value, goodMax, poorMin, 100, 0);
}

/** Continuity score по WASO и числу пробуждений */
export function computeContinuityScore(
  wasoMinutes: number,
  awakeningCount: number,
): number {
  const wasoScore = scoreFromRange(
    wasoMinutes,
    SLEEP_SCORE_WASO_GOOD_MAX,
    SLEEP_SCORE_WASO_POOR_MIN,
  );
  const awakeningScore = scoreFromRange(
    awakeningCount,
    SLEEP_SCORE_AWAKENINGS_GOOD_MAX,
    SLEEP_SCORE_AWAKENINGS_POOR_MIN,
  );
  return Math.round(Math.min(wasoScore, awakeningScore));
}
