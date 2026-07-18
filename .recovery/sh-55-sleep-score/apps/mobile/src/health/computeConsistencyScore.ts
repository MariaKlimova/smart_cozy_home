import {
  SLEEP_SCORE_CONSISTENCY_GOOD_MAX,
  SLEEP_SCORE_CONSISTENCY_POOR_MIN,
} from '@/health/sleepScore.const';
import { lerpClamped, sampleStdDev } from '@/health/sleepScoreMath';

/** Минуты от локальной полуночи (с учётом перехода через сутки для bedtime) */
export function clockMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

/**
 * Bedtime как минуты относительно якоря 18:00 предыдущего дня,
 * чтобы 23:00 и 01:00 были на одной шкале.
 */
export function bedtimeAnchorMinutes(fellAsleepAt: Date): number {
  const minutes = clockMinutesFromMidnight(fellAsleepAt);
  const anchor = 18 * 60;
  if (minutes >= anchor) {
    return minutes - anchor;
  }
  return minutes + (24 * 60 - anchor);
}

/** Consistency score по stddev отбоя и подъёма; null если меньше 2 ночей */
export function computeConsistencyScore(
  fellAsleepAts: Date[],
  wokeAts: Date[],
): number | null {
  if (fellAsleepAts.length < 2 || wokeAts.length < 2) {
    return null;
  }

  const bedtimeMinutes = fellAsleepAts.map(bedtimeAnchorMinutes);
  const wakeMinutes = wokeAts.map(clockMinutesFromMidnight);
  const avgStd =
    (sampleStdDev(bedtimeMinutes) + sampleStdDev(wakeMinutes)) / 2;

  if (avgStd <= SLEEP_SCORE_CONSISTENCY_GOOD_MAX) {
    return 100;
  }
  if (avgStd >= SLEEP_SCORE_CONSISTENCY_POOR_MIN) {
    return 0;
  }

  return Math.round(
    lerpClamped(
      avgStd,
      SLEEP_SCORE_CONSISTENCY_GOOD_MAX,
      SLEEP_SCORE_CONSISTENCY_POOR_MIN,
      100,
      0,
    ),
  );
}
