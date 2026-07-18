import type { TSleepScoreAgeBand } from '@/health/sleepScore.typings';

/** Вес duration в полном score */
export const SLEEP_SCORE_WEIGHT_DURATION = 0.35;

/** Вес efficiency */
export const SLEEP_SCORE_WEIGHT_EFFICIENCY = 0.25;

/** Вес continuity */
export const SLEEP_SCORE_WEIGHT_CONTINUITY = 0.2;

/** Вес consistency */
export const SLEEP_SCORE_WEIGHT_CONSISTENCY = 0.2;

/** Минимум ночей для baseline и consistency */
export const SLEEP_SCORE_BASELINE_NIGHTS = 7;

/** Клинический порог «норма» TST, минуты (7 ч) */
export const SLEEP_SCORE_RECOMMENDED_TST_MINUTES = 420;

/** Число ночей в batch-истории HealthKit */
export const WEARABLE_SLEEP_HISTORY_NIGHTS = 31;

/** Efficiency: ниже — score 0 */
export const SLEEP_SCORE_EFFICIENCY_FLOOR = 0.7;

/** Efficiency: выше — score 100 */
export const SLEEP_SCORE_EFFICIENCY_CEILING = 0.95;

/** Continuity: WASO норма, мин */
export const SLEEP_SCORE_WASO_GOOD_MAX = 20;

/** Continuity: WASO штраф до 0, мин */
export const SLEEP_SCORE_WASO_POOR_MIN = 40;

/** Continuity: пробуждения норма */
export const SLEEP_SCORE_AWAKENINGS_GOOD_MAX = 1;

/** Continuity: пробуждения штраф до 0 */
export const SLEEP_SCORE_AWAKENINGS_POOR_MIN = 4;

/** Consistency: stddev норма, мин */
export const SLEEP_SCORE_CONSISTENCY_GOOD_MAX = 15;

/** Consistency: stddev штраф до 0, мин */
export const SLEEP_SCORE_CONSISTENCY_POOR_MIN = 90;

/** Baseline: deviation ≤ этого → +10 */
export const SLEEP_SCORE_BASELINE_DEV_CLOSE = 15;

/** Baseline: deviation ≤ этого → +5 */
export const SLEEP_SCORE_BASELINE_DEV_NEAR = 45;

/** Baseline modifier close */
export const SLEEP_SCORE_BASELINE_BONUS_CLOSE = 10;

/** Baseline modifier near */
export const SLEEP_SCORE_BASELINE_BONUS_NEAR = 5;

/** Возраст начала группы 65+ */
export const SLEEP_SCORE_OLDER_AGE_YEARS = 65;

/** Возрастная группа по годам; без возраста — взрослые */
export function sleepScoreAgeBand(ageYears?: number): TSleepScoreAgeBand {
  if (ageYears !== undefined && ageYears >= SLEEP_SCORE_OLDER_AGE_YEARS) {
    return 'older';
  }
  return 'adult';
}
