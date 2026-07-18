import { SLEEP_SCORE_BASELINE_NIGHTS } from '@/health/sleepScore.const';
import type { ISleepScoreNightInput } from '@/health/sleepScore.typings';
import { median } from '@/health/sleepScoreMath';

/** Rolling-окно ночей, заканчиваясь на endIndex включительно */
export function rollingWindowNights(
  nights: ISleepScoreNightInput[],
  endIndex: number,
  windowSize: number,
): ISleepScoreNightInput[] {
  const start = Math.max(0, endIndex - windowSize + 1);
  return nights.slice(start, endIndex + 1);
}

/** Baseline median TST по rolling окну (включая текущую ночь) */
export function resolveBaselineMinutes(
  nights: ISleepScoreNightInput[],
  nightIndex: number,
): number | undefined {
  const window = rollingWindowNights(nights, nightIndex, SLEEP_SCORE_BASELINE_NIGHTS);
  if (window.length < SLEEP_SCORE_BASELINE_NIGHTS) {
    return undefined;
  }
  return median(window.map((night) => night.totalSleepMinutes));
}

/** Средний TST за rolling 7 ночей до nightIndex включительно */
export function rollingAverageTst(
  nights: ISleepScoreNightInput[],
  nightIndex: number,
): number | undefined {
  const window = rollingWindowNights(nights, nightIndex, SLEEP_SCORE_BASELINE_NIGHTS);
  if (window.length === 0) {
    return undefined;
  }
  const sum = window.reduce((acc, night) => acc + night.totalSleepMinutes, 0);
  return sum / window.length;
}
